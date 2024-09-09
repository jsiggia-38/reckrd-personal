'use client';

import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doCreateUserWithEmailAndPassword } from "../firebase/auth"
import { AuthProvider, useAuth } from "../contexts/authContext"
import { useNavigate } from "react-router-dom"

const Login: React.FC = () =>  {
    const { userLoggedIn } = useAuth()

    const [loginMode, setLoginMode] = useState(true);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const switchLogin = () => {
        if (loginMode) {
            setLoginMode(false)
        } else {
            setLoginMode(true)
        }
    }

    const handleEmailChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setPassword(e.target.value)
    }

    const handleConfirmPasswordChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setConfirmPassword(e.target.value)
    }

    const onLogin = async () => {
        console.log(userLoggedIn)
        if(!isSigningIn) {
            setIsSigningIn(true)
            if (loginMode) {
                await doSignInWithEmailAndPassword(email, password)
            } else {
                await doCreateUserWithEmailAndPassword(email, password)
            }
        }
        window.location.href = '/';
    }

    const onGoogleSignIn = () => {
        console.log(userLoggedIn)
        if(!isSigningIn) {
            setIsSigningIn(true)
            doSignInWithGoogle().catch(err => {
                setIsSigningIn(false)
            })
        }
        window.location.href = '/'
    }

  return (
    <>
        {
            <div>
                <img src='/images/loginBackground.jpg' style={{
                    height: "100%", 
                    width: "100%",
                    position: "fixed"
                }}/>
                <div className="screenLayout">
                    <div className='introText'>{loginMode ? "Welcome Back! Please Sign in" : "Welcome! Please Sign Up"}</div>
                    <Box sx={{position: "fixed", right: '5em', top: "10em", width: '384px', height: "70%", backgroundColor: "#1e3b57" }}>
                        <h1 className='loginHeader'>{loginMode ? "Login" : "Sign Up"}</h1>
                        <div className='fieldContainer'>
                            <h3 className='loginSubHeading'>Email</h3>
                            <TextField variant='filled' sx={{backgroundColor: "white", width: '95%'}} id='emailTextField' onChange={handleEmailChange}></TextField>
                            <br/> {loginMode && <br/>}
                            <h3 className='loginSubHeading'>Password</h3>
                            <TextField variant='filled' sx={{backgroundColor: "white", width: '95%'}} id='passwordTextField' onChange={handlePasswordChange}></TextField>
                            <br/> {loginMode && <br/>}
                            {!loginMode && <div><h3 className='loginSubHeading'>Confirm Password</h3><TextField variant='filled' sx={{backgroundColor: "white", width: '95%'}} id='confirmPasswordTextField' onChange={handleConfirmPasswordChange}></TextField><br/> <br/></div>}
                            {loginMode && <p className='accountText'>Need an account? <a onClick={switchLogin} className='link'>Sign Up Here!</a></p>}
                            {!loginMode && <p className='accountText'>Already have an account? <a onClick={switchLogin} className='link'>Login Here!</a></p>}
                            <br/>
                            <Button variant='contained' sx={{backgroundColor: "#376fa3", width: '143px', height: "72px", fontWeight: "bold", fontSize: "25px", justifySelf: "center"}} onClick={onLogin}>{loginMode ? "Login" : "Sign Up"}</Button>
                            <br/> {loginMode && <br/>}
                            <div className='line'></div>
                            <p className='accountText altLogin'>{loginMode ? "Or Login With" : "Or Sign Up With"}</p>
                            {loginMode && <br/>}
                            <img src='/images/google.png' className="googleLogo" onClick={onGoogleSignIn}/>
                        </div>
                    </Box>
                </div>
            </div>
        }
    </>
    
  );
}

export default Login