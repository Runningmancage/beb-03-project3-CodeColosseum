import axios from "axios";
import { fromDb } from "../../config";
import contract from "../../contract";
import models from "../../models";
import { gradingMission, updateUserMineralBalance } from "../../utils";

const post = async (req: any, res: any) => {
  const { account, missionId, code, reqType } = req.body;

  try {
    const userInfo = await models.User.findOne({ account });
    const missionInfo = await models.Mission.findOne({ _id: missionId });
    const testCases =
      reqType === 1
        ? missionInfo.testCases.filter((testCase: any) => {
            return testCase.isExample === true;
          })
        : missionInfo.testCases;
    const gradingResult = await gradingMission(testCases, code);

    try {
      let challenge;
      if (reqType === 2) {
        challenge = {
          challenger: userInfo._id,
          mission: missionId,
          kind: 2,
          answerCode: code,
          isPassed: gradingResult.data.failCount === 0 ? true : false,
          PassedCasesRate: `${
            testCases.length - gradingResult.data.failCount
          } / ${testCases.length}`,
          passedCases: gradingResult.data.passedCases,
        };
        await models.Challenge.create(challenge);
      }

      // 풀이에 성공한 경우 미네랄 지급
      if (gradingResult.data.failCount === 0) {
        console.log("미네랄 지급 시작");
        // TODO
        // challenger에게 +mineral
        // mineral log 기록
        // 중복 지급 방지
        const challengeInfo = await models.Challenge.findOne(challenge);
        await contract.createMiningMineralLog(challengeInfo);
        await updateUserMineralBalance(userInfo.id);

        console.log("미네랄 지급 완료");

        // nft 보유자는 토큰이 쌓임
        await editMineOwnerRewardLog("reward", missionId);
      }

      res
        .status(200)
        .send({ message: gradingResult.message, data: gradingResult.data });
    } catch (err) {
      console.log(err);
      res.status(400).send({ message: "DB upload Error" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Failed to load data" });
  }
};

export = { post };

const editMineOwnerRewardLog = async (code: string, missionId: string) => {
  // mission id로 nft 정보 조회
  // const nft = await models.Nft.findOne({missionId})

  // 현 nft의 owner를 추출

  const rewardLogSchema = {
    code,
    // nft,
    // user : nft.owner,
    amount: fromDb.CCToken.token,
  };

  await models.MineOwnerRewardLog.create(rewardLogSchema);
};
