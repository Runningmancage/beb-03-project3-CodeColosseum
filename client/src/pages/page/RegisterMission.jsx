import { Arguments, FunctionArea, TestCases, Explanation } from './../../components/RegisterMission';
import S from './RegisterMission.styled';
import { useArguments } from '../../utils/arguments';
import { useRegister } from '../../utils/register';
import { useCallback } from 'react';

const RegisterMission = () => {
    const [argCount, argTypes, handleAddArg, handleRemoveArg, handleArgTypes] = useArguments();
    const [registerData, handleExplanation, handleCode, handleAddTestCase, handleRemoveTestCase, handleTitle, handleTestCaseHide, handleEmptyTestcase] = useRegister();

    const submitMission = useCallback(() => {
        const completeData = {...registerData, argTypes};
        if(!completeData.title) {
            alert("제목을 입력하세요!");
            return;
        } else if(!completeData.explanation) {
            alert("문제에는 설명이 필요합니다!")
            return;
        } else if(!completeData.code) {
            alert("이 문제의 레퍼런스 코드를 입력해주세요!");
            return;
        } else if(completeData.testcases.length < 5){
            alert("최소 5개 이상의 테스트 케이스가 필요합니다!");
            return;
        }
        console.log(completeData);
    }, [registerData, argTypes]);

    return (
    <S.RegisterMission>
        <S.Input placeholder='문제 이름을 입력하세요' onChange={handleTitle}/>
        <Arguments handleAddArg={handleAddArg} handleRemoveArg={handleRemoveArg} argCount={argCount} argTypes={argTypes} handleArgTypes={handleArgTypes} handleEmptyTestcase={handleEmptyTestcase}/>
        <S.Section>
            <Explanation handleExplanation={handleExplanation}/>
            <FunctionArea handleCode={handleCode}/>
        </S.Section>
        <TestCases testcases={registerData.testcases} handleAddTestCase={handleAddTestCase} handleRemoveTestCase={handleRemoveTestCase} argTypes={argTypes} handleTestCaseHide={handleTestCaseHide}/>
        <S.Button onClick={submitMission}>문제 등록하기</S.Button>
    </S.RegisterMission>
    );
}

export default RegisterMission;