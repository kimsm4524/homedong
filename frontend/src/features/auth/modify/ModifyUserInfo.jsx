import { useState, React, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Button } from '@material-ui/core';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { makeStyles } from '@material-ui/core/styles';
import { deleteToken } from '../../../common/api/JWT-common';

import {
  checkNickname,
  modifyNickname,
  modifyPassword,
  setNicknameCheckedFalse,
} from '../authSlice';

// style
const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModifyContainer = styled.div`
  height: 80%;
  width: 80%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
const Title = styled.span`
  font-size: 2.5rem;
`;

const useStyles = makeStyles({
  validatorForm: {
    width: '35%',
  },
});

// logic
export default function ModifyUserInfo() {
  // local state
  const [newNickname, setNickname] = useState('');
  const [newPassword, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const { isNicknameChecked } = useSelector((state) => state.auth);
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  // setState when user change input
  function handleNickname(event) {
    const { value } = event.target;
    if (isNicknameChecked) {
      dispatch(setNicknameCheckedFalse());
    }
    if (value.length < 7) {
      setNickname(value.trim());
      return true;
    }
    return false;
  }

  function doCheckNickname() {
    if (newNickname) {
      dispatch(checkNickname(newNickname))
        .unwrap()
        .then(() => {
          toast.success('😀 사용가능한 닉네임입니다');
        })
        .catch((err) => {
          if (err.status === 400) {
            toast.error('😀 입력한 정보를 다시 확인해주세요');
          } else if (err.status === 409) {
            toast.error('😀 이미 존재하는 닉네임입니다');
          } else if (err.status === 500) {
            history.push('/error');
          }
        });
    } else {
      alert('입력해주세요');
    }
  }

  // submit when user click button
  function handleSubmit(event) {
    event.preventDefault();
    const { name } = event.target;
    const data = {
      newNickname,
      newPassword,
    };
    return name === 'nickname'
      ? dispatch(modifyNickname(data))
          .unwrap()
          .then(() => {
            toast.info('😀 닉네임 변경이 완료되었습니다');
          })
          .catch((err) => {
            if (err.status === 400) {
              toast.error('😀 입력한 정보를 다시 확인해주세요');
            } else if (err.status === 401) {
              toast.error('😀 로그인이 필요합니다');
            } else if (err.status === 409) {
              toast.error('😀 이미 존재하는 닉네임입니다');
            } else if (err.status === 500) {
              history.push('/error');
            } // 404에러 처리
          })
      : dispatch(modifyPassword(data))
          .unwrap()
          .then(() => {
            deleteToken();
            history.push('/');
            toast.success(
              '😀비밀번호 수정이 완료되었습니다. 다시 로그인해주세요'
            );
          })
          .catch((err) => {
            if (err.status === 400) {
              toast.error('😀 입력한 정보를 다시 확인해주세요');
            } else if (err.status === 401) {
              toast.error('😀 다시 로그인해주세요');
            } else if (err.status === 500) {
              history.push('/error');
            } // 404에러 처리 필요
          });
  }

  // validation (same password)
  useEffect(() => {
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
      if (value !== newPassword) {
        return false;
      }
      return true;
    });
  }, [repeatPassword]);

  // validation (maxlength)
  useEffect(() => {
    ValidatorForm.addValidationRule('maxNumber', (value) => {
      if (value.length > 6) {
        return false;
      }
      return true;
    });
  }, [newNickname]);

  return (
    <Wrapper>
      <ModifyContainer>
        <Title>회원정보수정</Title>
        <ValidatorForm
          onSubmit={handleSubmit}
          className={classes.validatorForm}
          name="nickname"
        >
          <TextValidator
            label="닉네임"
            onChange={handleNickname}
            color="secondary"
            name="nickname"
            value={newNickname}
            validators={['required']}
            errorMessages={['닉네임을 입력해주세요']}
            helperText="최대 6글자입니다."
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
            size="small"
            fullWidth
          />
          <Button onClick={doCheckNickname} disabled={isNicknameChecked}>
            중복확인
          </Button>
          <Button type="submit" disabled={!isNicknameChecked}>
            변경하기
          </Button>
        </ValidatorForm>
        <ValidatorForm
          onSubmit={handleSubmit}
          className={classes.validatorForm}
          name="password"
        >
          <TextValidator
            label="비밀번호"
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            type="password"
            value={newPassword}
            validators={['required']}
            errorMessages={['비밀번호를 입력해주세요']}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextValidator
            label="비밀번호 확인"
            onChange={(e) => setRepeatPassword(e.target.value)}
            type="password"
            name="repeatPassword"
            value={repeatPassword}
            validators={['isPasswordMatch', 'required']}
            errorMessages={[
              '비밀번호가 일치하지 않습니다',
              '비밀번호를 입력해주세요',
            ]}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            margin="normal"
            size="small"
            fullWidth
          />
          <Button type="submit">Submit</Button>
        </ValidatorForm>
      </ModifyContainer>
    </Wrapper>
  );
}
