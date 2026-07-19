import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {progressAPI} from '../api/api';

interface ProgressState {
  progress: any;
  tasks: any[];
  stats: any;
  history: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  progress: null, tasks: [], stats: null, history: [], loading: false, error: null,
};

export const fetchAll = createAsyncThunk('progress/fetchAll', async () => {
  const [prog, tasks, stats] = await Promise.all([
    progressAPI.get(), progressAPI.tasks(), progressAPI.stats(),
  ]);
  return { progress: prog.data, tasks: tasks.data, stats: stats.data };
});

export const fetchHistory = createAsyncThunk('progress/history', async () => {
  const r = await progressAPI.history();
  return r.data.history;
});

export const recordLinkClick = createAsyncThunk('progress/linkClick',
  async ({taskId, day}: {taskId:string;day:number}) => {
    await progressAPI.linkClick(taskId, day);
  }
);

export const completeTask = createAsyncThunk('progress/complete',
  async ({taskId, day}: {taskId:string;day:number}) => {
    const r = await progressAPI.completeTask(taskId, day);
    return r.data;
  }
);

export const resetProgress = createAsyncThunk('progress/reset', async () => {
  await progressAPI.reset();
});

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAll.pending,   s => { s.loading=true; })
      .addCase(fetchAll.fulfilled, (s,a) => {
        s.loading=false;
        s.progress=a.payload.progress;
        s.tasks=a.payload.tasks;
        s.stats=a.payload.stats;
      })
      .addCase(fetchAll.rejected,  (s,a) => { s.loading=false; s.error=String(a.error.message); })
      .addCase(fetchHistory.fulfilled, (s,a) => { s.history=a.payload; })
      .addCase(completeTask.fulfilled, (s,a) => {
        if (a.payload?.stats) s.stats=a.payload.stats;
        if (a.payload?.progress) s.progress=a.payload.progress;
      })
      .addCase(resetProgress.fulfilled, s => {
        s.progress=null; s.tasks=[]; s.stats=null; s.history=[];
      });
  },
});

export default progressSlice.reducer;
