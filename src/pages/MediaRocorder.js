import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Grid
} from '@mui/material';

//icons
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import PauseCircleFilledRoundedIcon from '@mui/icons-material/PauseCircleFilledRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import VideocamIcon from '@mui/icons-material/Videocam';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';

const MediaRocorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [time, setTime] = useState(0);
    const timeRef = useRef(null);
    
    const [recordingURL, setRecordingURL] = useState('');
    const [isVideoMode, setIsVideoMode] = useState(false);
    
    const mediaStream = useRef(null);
    const mediaRecorder = useRef(null);
    const chunks = useRef([]);
    
    const videoPreviewRef = useRef(null);
    const audioPreviewRef = useRef(null);
    
    useEffect(() => {
    if (isRecording && mediaStream.current) {
        if (isVideoMode && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream.current;
        videoPreviewRef.current.play();
        }
        if (!isVideoMode && audioPreviewRef.current) {
        audioPreviewRef.current.srcObject = mediaStream.current;
        audioPreviewRef.current.play();
        }
    }
    }, [isRecording, isVideoMode]);

    //start Recording
    const startRecording = async () => {
    try {
        setTime(0);
        setRecordingURL('');
        const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoMode
        });

        mediaStream.current = stream;

        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunks.current.push(e.data);
        }
        };

        setIsRecording(true);
        timeRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
        }, 1000);

        mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, {
            type: isVideoMode ? 'video/webm' : 'audio/webm'
        });
        const url = URL.createObjectURL(recordedBlob);
        setRecordingURL(url);
        chunks.current = [];

        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
            mediaStream.current = null;
        }
        };

        mediaRecorder.current.start();
    } catch (error) {
        console.error(error);
    }
    };
    
    //start Recording
    const pauseRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            clearInterval(timeRef.current);
        }
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
        }
    };
    
    //stop Recording
    const stopRecording = () => {
        pauseRecording();
        setTime(0);
    };
    
    //downloading to store locally
    const downloadRecording = () => {
        const a = document.createElement('a');
        a.href = recordingURL;
        a.download = isVideoMode ? 'recording_video.webm' : 'recording_audio.webm';
        a.click();
    };
    
    //time format
    const formatTimer = (seconds) => {
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const min = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const sec = String(seconds % 60).padStart(2, '0');
        return `${hrs}:${min}:${sec}`;
    };
    
    //toggle Button video/audio
    const handleToggle = () => {
        if (isRecording) {
            alert('Stop recording first before switching mode.');
            return;
        }
        setIsVideoMode(!isVideoMode);
        setRecordingURL('');
    };

    return (
    <>
    <Grid container sx={{backgroundColor: '#f5f5f5', minHeight: '100vh', display:"flex", alignItems:"center", justifyContent:"center"}}>
        <Grid item xs={12} md={12} lg={12}>
            <Typography variant="h4" align="center" gutterBottom sx={{color: '#1976d2', fontSize:{xs:"20px", md:"26px",sm:"24px",lg:"26px"}}}>
                Media Recorder
            </Typography>
            <Card sx={{width:"100%", mx: 'auto', boxShadow: 5 }}>
            <CardContent>
                <Stack alignItems="center">
                    <Typography variant="subtitle1" sx={{fontSize:{xs:"16px", md:"26px", lg:"26px", sm:"20px"}}}>
                        {isVideoMode ? 'Video Recording' : 'Audio Recording'}
                    </Typography>
                    <Box>
                        {isVideoMode ? <VideocamIcon sx={{fontSize:{ xs: 24, md: 50, sm:50, lg:50 }, color: '#1976d2'}} /> : <KeyboardVoiceIcon sx={{fontSize:{ xs: 24, md: 50, sm:50, lg:50 }, color: '#d32f2f'}} /> }
                    </Box>
                    <Typography variant="h6" color="primary" sx={{fontSize:{xs:"18px", md:"26px", lg:"28px", sm:"24px"}}} >
                        {formatTimer(time)}
                    </Typography>
                </Stack>
                <Divider sx={{ mb: 2, color:"black" }} />
    
                {isRecording && (
                <Box mb={2} sx={{ border: '1px solid #ddd', p: 3, borderRadius: 2 }}>
                    {isVideoMode ? (
                    <video
                        ref={videoPreviewRef}
                        autoPlay
                        muted
                        style={{ width: '100%', height: '300px', borderRadius: 8 }}
                    />
                    ) : (
                    <audio ref={audioPreviewRef} autoPlay muted controls style={{ width: '100%' }} />
                    )}
                </Box>
                )}
    
                {recordingURL && (
                <Box mb={2} sx={{ border: '1px solid #ddd', p: 1, borderRadius: 2 }}>
                    {isVideoMode ? (
                    <video controls src={recordingURL} style={{ width: '100%', height: '300px', borderRadius: 8 }} />
                    ) : (
                    <audio controls src={recordingURL} style={{ width: '100%' }} />
                    )}
                </Box>
                )}

                {/* handle Buttons */}
                <Stack direction="row" spacing={2} justifyContent="center">
                {!isRecording ? (
                    <Button variant="contained" startIcon={<PlayCircleFilledRoundedIcon sx={{ fontSize: { xs: 16, sm: 24, md: 32 } }} />} onClick={startRecording} sx={{fontSize: { xs: '12px', sm: '14px', md: '16px' },padding: { xs: '4px 8px', sm: '6px 16px', md: '8px 24px' }, width: { xs: '100px', sm: '120px', md: '140px' },height: { xs: '32px', sm: '40px', md: '48px' }}}>
                    Start
                    </Button>
                ) : (
                    <Button variant="contained" color="warning" startIcon={<PauseCircleFilledRoundedIcon sx={{ fontSize: { xs: 16, sm: 24, md: 32 } }}  />} onClick={pauseRecording} sx={{fontSize: { xs: '12px', sm: '14px', md: '16px' },padding: { xs: '4px 8px', sm: '6px 16px', md: '8px 24px' }, width: { xs: '100px', sm: '120px', md: '140px' },height: { xs: '32px', sm: '40px', md: '48px' }}}>
                    Pause
                    </Button>
                )}
                <Button variant="contained" startIcon={<StopCircleRoundedIcon sx={{ fontSize: { xs: 16, sm: 24, md: 32 } }}  />} onClick={stopRecording} sx={{fontSize: { xs: '12px', sm: '14px', md: '16px' },padding: { xs: '4px 8px', sm: '6px 16px', md: '8px 24px' }, width: { xs: '100px', sm: '120px', md: '140px' },height: { xs: '32px', sm: '40px', md: '48px' }, backgroundColor:'#D32F2F', '&:hover': { backgroundColor: '#B71C1C' }}}>
                    Stop
                </Button>
                {recordingURL && (
                    <Button variant="contained" color="success" startIcon={<FileDownloadRoundedIcon sx={{ fontSize: { xs: 16, sm: 24, md: 32 } }}  />} onClick={downloadRecording} sx={{fontSize: { xs: '12px', sm: '14px', md: '16px' },padding: { xs: '4px 8px', sm: '6px 16px', md: '8px 24px' }, width: { xs: '100px', sm: '120px', md: '140px' },height: { xs: '32px', sm: '40px', md: '48px' }}}>
                    Download
                    </Button>
                )}
                
                {/* toggleButton */}
                <FormControlLabel
                    control={<Switch checked={isVideoMode} onChange={handleToggle} />}
                    label={isVideoMode? <p sx={{fontSize:{xs:"14px", sm:"16px", md:"18px"}, color:"#1976d2"}}>Video</p> : <p>Audio</p> }
                />
                </Stack>
            </CardContent>
            </Card>
        </Grid>
    </Grid>   
    </>
  )
}

export default MediaRocorder
