import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import type { Room } from 'util/type/gameType';
import { HTTP_ADDRESS } from 'util/const';
import { getCookie, JsonHttpReponse } from 'util/util';
interface RoomInfo {
  count: number;
  index: number;
  room_name: string;
  start: boolean;
}
export default function BasicTable() {
  const [gameList, setGameList] = React.useState<RoomInfo[]>([]);
  const [polling, setPolling] = React.useState<number>(0);
  React.useEffect(() => {
    JsonHttpReponse(`${HTTP_ADDRESS}storage/room/0`, {
      method: 'GET',
    }).then((response) => {
      console.log(response);
      if (response.state === 200) {
        setGameList(response.data);
      } else {
        console.log('방 조회 실패,,,');
      }
    });
  }, [polling]);
  setTimeout(() => {
    setPolling(polling + 1);
  }, 10000);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">방 번호</TableCell>
            <TableCell align="left">방 제목</TableCell>
            <TableCell align="left">인원</TableCell>
            <TableCell align="left">상태</TableCell>
            {/* <TableCell align="right">Protein&nbsp;(g)</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {gameList.length === 0 ? (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                방이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            gameList.map((row) => (
              <TableRow key={row.index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" align="left">
                  {row.index}
                </TableCell>
                <TableCell align="left">{row.room_name}</TableCell>
                <TableCell align="left">{row.count}</TableCell>
                <TableCell align="left">{row.start ? '진행중' : '대기중'}</TableCell>
                {/* <TableCell align="right">{row.protein}</TableCell> */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import InputLabel from '@mui/material/InputLabel';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(3),
  },
  '& .MuiInputBase-input': {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}));

export const GameTopLayout = () => {
  const [open, setOpen] = React.useState(false);
  const [gameMode, setGameMode] = React.useState<Boolean>(true);
  const [roomName, setRoomName] = React.useState<string>('');
  const [difficulty, setDifficulty] = React.useState<number>(0);
  const navigate = useNavigate();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleCreateRoom = () => {
    setOpen(false);
    if (gameMode) {
      // const onClickEvent = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      // navigate(`/game/${}`);
      JsonHttpReponse(`${HTTP_ADDRESS}storage/room/1?room_name=${roomName}`, {
        method: 'POST',
      }).then((data) => {
        if (data.state === '200') {
          navigate(`/game/${data.room_index}`);
        } else {
          console.log('방 생성 실패,,,');
        }
      });
      // };
    } else {
      navigate(`/ai_game/${difficulty}`);
    }
  };
  return (
    <div>
      <FormControl sx={{ m: 1 }} variant="standard">
        <InputLabel htmlFor="demo-customized-textbox">Age</InputLabel>
        <BootstrapInput id="demo-customized-textbox" />
      </FormControl>
      <div>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={handleClickOpen}>
            방만들기
          </Button>
          {/* <Button variant="outlined" disabled>  Disabled</Button> */}
          {/* <Button variant="outlined" href="#outlined-buttons">Link</Button> */}
        </Stack>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>방 만들기</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel id="demo-row-radio-buttons-group-label">모드</FormLabel>
              <RadioGroup row aria-labelledby="demo-row-radio-buttons-group-label">
                <FormControlLabel
                  value="together"
                  control={
                    <Radio
                      checked={gameMode == true}
                      name="mode"
                      onChange={() => {
                        setGameMode(true);
                      }}
                    />
                  }
                  label="1대1 대국"
                />
                <FormControlLabel
                  value="alone"
                  control={
                    <Radio
                      name="mode"
                      checked={gameMode == false}
                      onChange={() => {
                        setGameMode(false);
                      }}
                    />
                  }
                  label="AI 대국"
                />
              </RadioGroup>
            </FormControl>
            {gameMode && (
              <>
                <DialogContentText>방 이름을 입력해주세요. (글자 수 제한 : 15)</DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="방 이름"
                  type="email"
                  fullWidth
                  variant="standard"
                  onChange={(event) => {
                    setRoomName(event.target.value);
                  }}
                />
              </>
            )}
            {!gameMode && (
              <div>
                <FormControl>
                  <FormLabel id="demo-row-radio-buttons-group-label">난이도를 선택해주세요</FormLabel>
                  <RadioGroup row aria-labelledby="demo-row-radio-buttons-group-label">
                    <FormControlLabel
                      value="1"
                      control={
                        <Radio
                          name="difficulty"
                          checked={difficulty === 0}
                          onChange={() => {
                            setDifficulty(0);
                          }}
                        />
                      }
                      label="초급"
                    />
                    <FormControlLabel
                      value="2"
                      control={
                        <Radio
                          checked={difficulty === 1}
                          name="difficulty"
                          onChange={() => {
                            setDifficulty(1);
                          }}
                        />
                      }
                      label="중급"
                    />
                    <FormControlLabel
                      value="3"
                      control={
                        <Radio
                          checked={difficulty === 2}
                          name="difficulty"
                          onChange={() => {
                            setDifficulty(2);
                          }}
                        />
                      }
                      label="고급"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>취소</Button>
            <Button onClick={handleCreateRoom}>생성</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};
