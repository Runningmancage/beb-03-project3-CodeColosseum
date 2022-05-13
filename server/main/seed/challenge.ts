import config from '../src/config';
// import { faker } from '@faker-js/faker';
import { MongoClient, ServerApiVersion } from 'mongodb';
import duummyChallenges from '../src/dummy/challenges';
import utils from '../src/utils';
import axios from 'axios';

async function seedDB() {

    if (config.ENV.MONGO_URI) {
        const client = new MongoClient(config.ENV.MONGO_URI, { serverApi: ServerApiVersion.v1 });

        try {
            await client.connect();
            console.log(`DB ${config.ENV.MONGO_database} connected!!`);


            const challengesCollection = client.db(config.ENV.MONGO_database).collection("challenges");
            const missionsCollection = client.db(config.ENV.MONGO_database).collection("missions");
            const usersCollection = client.db(config.ENV.MONGO_database).collection("users");

        // 삭제
            await challengesCollection.drop()
                .then(async () => {
                    console.log("challenges dropped!!");
                    
                    // // seed 개발 과정에서 콜렉션이 비어있으면 발생하는 오류를 제거하기위한 초기화 더미 도큐먼트 하나 생성
                    // const challenger = await utils.func.getRandomId(usersCollection); // 랜덤한 유저 _id 가져오기
                    // const mission = await utils.func.getRandomId(missionsCollection); // 랜덤한 미션 _id 가져오기
                    
                    // await challengesCollection.insertOne({
                    // challenger,
                    // mission,
                    // answerCode: `초기화 성공`,
                    // isPassed: true,
                    // passedCases: []
                    // })
                })
                // .then(() => console.log("Seeded init dummy!!"))

        // 더미 리스트 만들기
            let challengesData = [];
            for (let i = 0; i < duummyChallenges.length; i++) {
                const challenger = await utils.func.getRandomId(usersCollection); // 랜덤한 유저 _id 가져오기
                const mission = await missionsCollection.findOne({title: duummyChallenges[i].missionTitle}) // 미션 가져오기
                    .then((mission) => {
                        if (!mission) {
                            console.log(`mission not found by title: ${duummyChallenges[i].missionTitle}`);
                            return null;
                        } else {
                            return mission;
                        }
                    }
                );

                // grading 서버에서 채점해오기
                let isPassed
                let PassedCasesRate
                let passedCases
                if (mission) {
                    const testCases = mission.testCases;
                    const body = {
                        code: duummyChallenges[i].answerCode,
                        testCases
                    }
                    const { data } = await axios.post("http://localhost:3003/grading", body); // grading 서버에서 채점결과 가져옴
                    // 채점 결과를 바탕으로 isPassed, passedCasesRate, passedCases 정의
                    isPassed = data.data.failCount === 0? true : false;
                    PassedCasesRate = `${testCases.length-data.data.failCount} / ${testCases.length}`;
                    passedCases = data.data.passedCases;
                } else {
                    passedCases = undefined;
                    PassedCasesRate = undefined;
                    isPassed = undefined;
                }

                // 채점 결과로 challenge 만들기
                const challenge = {
                    challenger,
                    mission: mission? mission._id : undefined,
                    kind: 1,
                    answerCode: duummyChallenges[i].answerCode,
                    isPassed,
                    PassedCasesRate,
                    passedCases,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }

                // 푸시
                challengesData.push(challenge);
            }

        // 삽입
            await challengesCollection.insertMany(challengesData)
                .then(() => console.log("Seeded Challenges!!"))
            
            client.close();
        } catch (e:any) {
            console.log(e.stack);
        }

    } else { console.log(`DB not connected!! Because MONGO_URI is Undefined.`); }
}

seedDB();