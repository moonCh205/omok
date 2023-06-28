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

export default function BasicTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat&nbsp;(g)</TableCell>
            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
            <TableCell align="right">Protein&nbsp;(g)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{/* rows.map((row) => (  )) */}</TableBody>
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
  const [gameMode, setGameMode] = React.useState<Boolean>(false);
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
      const onClickEvent = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        // navigate(`/game/${}`);
      };
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
