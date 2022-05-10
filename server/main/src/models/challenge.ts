import { Schema, model } from "mongoose";

const ChallengeSchema = new Schema(
  {
    challenger: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 제출자
    mission: { type: Schema.Types.ObjectId, ref: "Mission", required: true }, // 문제
    answerCode: { type: String, required: true }, // 코드
    isPassed: { type: Boolean, required: true }, // 정답 여부
    PassedCasesRate: { type: String, required: true }, // 케이스 통과 비율 ( 통과케이스 수 / 전체케이스 수 )
    passedCases: { type: [Boolean], required: true }, // [true, false, true, ...] 테스트케이스 정답여부
    // time: { type: Number, required: true }, // 제출시간(초)
    // kind: { type: String, required: true }, // 제출 종목 (콜로세움, 연습 등)
  },
  { timestamps: true }
);

const Challenge = model("Challenge", ChallengeSchema);

export = Challenge