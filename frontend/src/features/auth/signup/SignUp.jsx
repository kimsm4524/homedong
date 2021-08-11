import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { Container, makeStyles } from '@material-ui/core';
import { toast } from 'react-toastify';
import { signup, checkNickname, setNicknameCheckedFalse } from '../authSlice';
import { CommonButton } from '../login/Login';
import logo from '../../../assets/logo.svg';

// style
const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const LogoWrapper = styled(Container)`
  height: 10%;
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.img`
  width: 400px;
  height: 200px;
`;

const LoginContainer = styled(Container)`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

const useStyles = makeStyles({
  validatorForm: {
    width: '35%',
  },
});

// logic
export default function SignUp() {
  // local state
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const { isNicknameChecked } = useSelector((state) => state.auth);
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isValidInputNickname, setIsValidInputNickname] = useState(false);
  const errRef = useRef(null);
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    setTimeout(() => {
      if (isNicknameChecked || !nickname || errRef.current.invalid[0]) {
        setIsValidInputNickname(false);
      } else {
        setIsValidInputNickname(true);
      }
    }, 10);
  }, [nickname, errRef.current, isNicknameChecked]);

  // validation (same password)
  useEffect(() => {
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
      if (value !== password) {
        return false;
      }
      return true;
    });
  }, [repeatPassword]);

  // setState when user change input
  function handleNickname(event) {
    const { value } = event.target;
    if (isNicknameChecked) {
      dispatch(setNicknameCheckedFalse());
    }
    if (value.length < 7) {
      setNickname(value.replace(/\s/g, ''));
      return true;
    }
    return false;
  }

  function handlePassword(event) {
    const { value } = event.target;
    if (value.length <= 16) {
      setPassword(value.replace(/\s/g, ''));
      return true;
    }
    return false;
  }

  function handleRepeatPassword(event) {
    const { value } = event.target;
    if (value.length <= 16) {
      setRepeatPassword(value.replace(/\s/g, ''));
      return true;
    }
    return false;
  }

  function isValidNickname() {
    dispatch(checkNickname(nickname))
      .unwrap()
      .then(() => {
        toast.success(`😀 사용할 수 있는 닉네임입니다`);
      })
      .catch(() => {
        toast.error(`😥 닉네임이 중복되었습니다`);
      });
  }

  // submit when user click button
  function handleSubmit(event) {
    event.preventDefault();
    const data = {
      email,
      nickname,
      password,
    };
    dispatch(signup(data))
      .unwrap()
      .then(() => {
        toast.success('😀 회원가입에 성공했습니다');
        history.push('/login');
      })
      .catch((err) => {
        if (err.status === 400) {
          toast.error('😥 입력된 정보를 다시 확인해주세요');
        } else if (err.status === 409) {
          toast.error('😥 중복된 이메일이 존재합니다.');
        } else if (err.status === 500) {
          history.push('/error');
        }
      });
  }

  return (
    <Wrapper>
      <LogoWrapper>
        <Logo src={logo} />
      </LogoWrapper>

      <LoginContainer>
        <ValidatorForm
          onSubmit={handleSubmit}
          className={classes.validatorForm}
        >
          <TextValidator
            label="닉네임"
            onChange={handleNickname}
            color="secondary"
            name="nickname"
            value={nickname}
            validators={['required', 'matchRegexp:^[가-힣|a-z|A-Z|0-9|]+$']}
            errorMessages={[
              '정보를 입력해주세요',
              '한글,영문,숫자만 입력해주세요',
            ]}
            helperText="최대 6글자입니다."
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
            size="small"
            fullWidth
            ref={errRef}
          />
          <CommonButton
            mauve="true"
            disabled={!isValidInputNickname}
            onClick={isValidNickname}
          >
            중복확인
          </CommonButton>
          <TextValidator
            label="이메일"
            onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
            name="email"
            value={email}
            validators={['required', 'isEmail']}
            errorMessages={[
              '정보를 입력해주세요',
              '유효하지 않은 이메일 형식입니다',
            ]}
            InputLabelProps={{
              shrink: true,
            }}
            margin="normal"
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextValidator
            label="비밀번호"
            onChange={handlePassword}
            name="password"
            type="password"
            value={password}
            validators={[
              'required',
              'matchRegexp:^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*[@$!%*#?&]).{8,16}$',
            ]}
            errorMessages={[
              '정보를 입력해주세요',
              '영어, 숫자, 특수문자 적어도 한 개 이상 포함해주세요(8~16자)',
            ]}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            size="small"
            fullWidth
          />
          <TextValidator
            label="비밀번호 확인"
            onChange={handleRepeatPassword}
            type="password"
            name="repeatPassword"
            value={repeatPassword}
            validators={['isPasswordMatch', 'required']}
            errorMessages={[
              '비밀번호가 일치하지 않습니다',
              '정보를 입력해주세요',
            ]}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            margin="normal"
            size="small"
            fullWidth
          />
          <CommonButton
            yellow="true"
            disabled={
              !isNicknameChecked || !email || !password || !repeatPassword
            }
            type="submit"
          >
            회원가입
          </CommonButton>
          <Link to="/login">
            <CommonButton mauve="true">로그인</CommonButton>
          </Link>
        </ValidatorForm>
      </LoginContainer>
    </Wrapper>
  );
}
