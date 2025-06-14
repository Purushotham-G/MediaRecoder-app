import { Box, Button, Card, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'

//icons
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import PauseCircleFilledRoundedIcon from '@mui/icons-material/PauseCircleFilledRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import VideocamIcon from '@mui/icons-material/Videocam';

//re-useable style component
const buttonStyles = {
  fontSize: { xs: '12px', sm: '14px', md: '16px' },
  padding: { xs: '4px 8px', sm: '6px 16px', md: '8px 24px' },
  width: { xs: '100px', sm: '120px', md: '140px' },
  height: { xs: '32px', sm: '40px', md: '48px' }
}

const VideoRecorder = () => {
    const [isRecording, setIsRecording] =  useState(false);
    const [time, setTime] = useState(0);
    const timeRef = useRef(null);

    const [recordingURL, setRecordingURL] = useState('');
    const mediaStream = useRef(null);
    const mediaRecorder = useRef(null);
    const chunks = useRef([])

    const videoPreviewRef = useRef(null);

    //start Recording
    const startRecording = async() =>{
        try{
            setTime(0);
            setRecordingURL('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video:true });
            mediaStream.current = stream;

            if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
            mediaRecorder.current = new MediaRecorder(stream)
            mediaRecorder.current.ondataavailable = (e) =>{
                if(e.data.size > 0 ){
                    chunks.current.push(e.data)
                }
            }
            if(!isRecording){
            setIsRecording(true)
            timeRef.current = setInterval(()=>{
                setTime(prev => prev +1)
            },1000)
        }
        mediaRecorder.current.onstop =() =>{
            const recordedBlob = new Blob(chunks.current, { type: 'video/webm'})
            const url = URL.createObjectURL(recordedBlob)
            setRecordingURL(url)

            chunks.current = []
            if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
    }
        }
        mediaRecorder.current.start()
        }
        catch(error){
            console.log(error)
        }
        
    }

    //pause Recording
    const pauseRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            clearInterval(timeRef.current);
        }
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            mediaStream.current.getTracks().forEach(track => track.stop());
        }
        if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = null;
        }
    }

    //stop Recording
    const stopRecording = () =>{
        pauseRecording()
        setTime(0)
    }

    //store locally file for downloading
    const downloadRecording = () => {
        const a = document.createElement('a');
        a.href = recordingURL;
        a.download = 'recording.webm'; // you can change name if you want
        a.click();
    }

    //timer Format
    const formatTimer = (seconds) =>{
        const hrs = String(Math.floor(seconds / 3600)).padStart(2,'0');
        const min = String(Math.floor((seconds % 3600)/60)).padStart(2,'0');
        const sec = String(seconds % 60).padStart(2,'0');
        return `${hrs}: ${min}: ${sec} `
    }
  return (

    <Grid container sx={{backgroundColor: '#f5f5f5', minHeight: '100vh', display:"flex", alignItems:"center", justifyContent:"center"}}>
        <Grid item xs={12} md={12} lg={12}>
            <Typography variant="h4" align="center" gutterBottom sx={{color: '#1976d2', fontSize:{xs:"20px", md:"26px",sm:"24px",lg:"26px"}}}>
                Video Recorder
            </Typography>
            <Card sx={{width:"100%", mx: 'auto', boxShadow: 5 }}>
            <CardContent>
                <Stack alignItems="center">
                <Typography variant="subtitle1" sx={{fontSize:{xs:"16px", md:"26px", lg:"26px", sm:"20px"}}}>
                    Recording
                </Typography>
                <VideocamIcon sx={{fontSize:{ xs: 24, md: 50, sm:50, lg:50 }, color: '#d32f2f'}} />
                <Typography variant="h6" color="primary" sx={{fontSize:{xs:"18px", md:"26px", lg:"28px", sm:"24px"}}} >
                    {formatTimer(time)}
                </Typography>
                </Stack>
                <Divider sx={{ color:"black" }} />
                    <Box sx={{ border: '1px solid #ddd', p: 1, borderRadius: 2,mb:1 }}>
                        {recordingURL ? (
                            <video controls src={recordingURL} style={{ width: '100%', height: '300px', borderRadius: 8 }} /> 
                        ) : (
                            <video ref={videoPreviewRef} autoPlay muted style={{ width: '100%', height: '300px', borderRadius: 8 }} />
                        )}
                    </Box>
                    
                    {/* buttons */}
                    <Stack direction="row" spacing={2} justifyContent="center">
                    {!isRecording ? (
                        <Button variant="contained" startIcon={<PlayCircleFilledRoundedIcon sx={{ fontSize: { xs: 16, sm: 24, md: 32 } }} />} onClick={startRecording} sx={buttonStyles}>
                        Start
                        </Button>
                    ) : (
                        <Button variant="contained" color="warning" startIcon={<PauseCircleFilledRoundedIcon sx={{ fontSize: { xs: 16, sm: 24, md: 32 } }}  />} onClick={pauseRecording} sx={buttonStyles}>
                        Pause
                        </Button>
                    )}
                    <Button variant="contained" startIcon={<StopCircleRoundedIcon sx={{ fontSize: { xs: 16, sm: 24, md: 32 } }}  />} onClick={stopRecording} sx={{fontSize: { xs: '12px', sm: '14px', md: '16px' },padding: { xs: '4px 8px', sm: '6px 16px', md: '8px 24px' }, width: { xs: '100px', sm: '120px', md: '140px' },height: { xs: '32px', sm: '40px', md: '48px' }, backgroundColor:'#D32F2F', '&:hover': { backgroundColor: '#B71C1C' }}}>
                        Stop
                    </Button>
                    {recordingURL && (
                        <Button variant="contained" color="success" startIcon={<FileDownloadRoundedIcon sx={{ fontSize: { xs: 16, sm: 24, md: 32 } }}  />} onClick={downloadRecording} sx={buttonStyles} >
                        Download
                        </Button>
                    )}
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    </Grid>
  )
}

export default VideoRecorder
