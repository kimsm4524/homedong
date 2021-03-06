import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ValidatorForm } from 'react-material-ui-form-validator';
import { makeStyles } from '@material-ui/core';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import { BeatLoader } from 'react-spinners';
import { signup, checkNickname, setNicknameCheckedFalse } from '../authSlice';
import { CommonButton, CommonTextValidator } from '../login/Login';
import logo from '../../../assets/logo.svg';
// style
const Wrapper = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const LogoWrapper = styled.div`
  flex: 0.4;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.img`
  width: 400px;
  height: 100px;
`;

const SignUpContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
const CustomLoadingOverlay = styled(LoadingOverlay)`
  & span > span {
    background-color: #fff;
    width: 20px;
    height: 20px;
  }
`;

const EmailTextValidator = styled(CommonTextValidator)`
  margin-bottom: 15px;
`;

const useStyles = makeStyles({
  validatorForm: {
    width: '40%',
  },
});

// logic
export default function SignUp() {
  // local state
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const { isNicknameChecked, isLoading } = useSelector((state) => state.auth);
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
        toast.success(`???? ????????? ??? ?????? ??????????????????`);
      })
      .catch((err) => {
        if (err.status === 400) {
          toast.error('???? ???????????? ????????? ?????? ??????????????????');
        } else if (err.status === 409) {
          toast.error('???? ????????? ??????????????????.');
        } else if (err.status === 500) {
          history.push('/error');
        }
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
        toast.success('???? ??????????????? ??????????????????');
        history.push('/emailcheckedplease');
      })
      .catch((err) => {
        if (err.status === 400) {
          toast.error(
            "???? ???????????? ????????? ?????? ??? ?????????????????? (??????????????? '???' ????????? ???????????????)"
          );
        } else if (err.status === 409) {
          toast.error('???? ????????? ???????????? ???????????????.');
        } else if (err.status === 500) {
          history.push('/error');
        }
      });
  }

  return (
    <CustomLoadingOverlay active={isLoading} spinner={<BeatLoader />}>
      <Wrapper>
        <LogoWrapper>
          <Logo src={logo} />
        </LogoWrapper>

        <SignUpContainer>
          <ValidatorForm
            onSubmit={handleSubmit}
            className={classes.validatorForm}
          >
            <CommonTextValidator
              label="?????????"
              onChange={handleNickname}
              color="secondary"
              name="nickname"
              value={nickname}
              validators={['required', 'matchRegexp:^[???-???|a-z|A-Z|0-9|]+$']}
              errorMessages={[
                '????????? ??????????????????',
                '??????,??????,????????? ??????????????????',
              ]}
              helperText="?????? 6???????????????."
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
              ????????????
            </CommonButton>
            <EmailTextValidator
              label="?????????"
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
              name="email"
              value={email}
              validators={[
                'required',
                'matchRegexp:^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$',
              ]}
              errorMessages={[
                '????????? ??????????????????',
                '???????????? ?????? ????????? ???????????????',
              ]}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
              variant="outlined"
              size="small"
              fullWidth
            />
            <CommonTextValidator
              label="????????????"
              onChange={handlePassword}
              name="password"
              type="password"
              value={password}
              validators={[
                'required',
                'matchRegexp:^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*[~!@#$%^&()+|=]).{8,16}$',
              ]}
              errorMessages={[
                '????????? ??????????????????',
                '??????, ??????, ????????????(~!@#$%^&()+|=)??? ????????? ??? ??? ?????? ??????????????????(8~16???)',
              ]}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              size="small"
              fullWidth
            />
            <CommonTextValidator
              label="???????????? ??????"
              onChange={handleRepeatPassword}
              type="password"
              name="repeatPassword"
              value={repeatPassword}
              validators={['isPasswordMatch', 'required']}
              errorMessages={[
                '??????????????? ???????????? ????????????',
                '????????? ??????????????????',
              ]}
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              margin="normal"
              size="small"
              fullWidth
            />
            <CommonButton mauve="true" type="submit" disabled={isLoading}>
              {isLoading ? '????????????????????????' : '????????????'}
            </CommonButton>
            <Link to="/login">
              <CommonButton disabled={isLoading} yellow="true">
                ????????? ?????? ??????
              </CommonButton>
            </Link>
          </ValidatorForm>
        </SignUpContainer>
      </Wrapper>
    </CustomLoadingOverlay>
  );
}
