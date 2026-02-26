import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { storageService } from '../services/async-storage.service'
import type { Todo } from '../types/todo'

const TODO_KEY = 'todo_db'

export const loadTodos = createAsyncThunk('todo/loadTodos', async () => {
    return await storageService.query<Todo>(TODO_KEY)
})

export const addTodo = createAsyncThunk('todo/addTodo', async (text: string) => {
    const todoToSave = { text, isDone: false, createdAt: Date.now() }
    return await storageService.post(TODO_KEY, todoToSave)
})

export const updateTodo = createAsyncThunk('todo/updateTodo', async (todo: Todo) => {
    return await storageService.put(TODO_KEY, todo)
})

export const removeTodo = createAsyncThunk('todo/removeTodo', async (id: string) => {
    await storageService.remove(TODO_KEY, id)
    return id
})

const todoSlice = createSlice({
    name: 'todo',
    initialState: { todos: [] as Todo[], isLoading: false },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadTodos.pending, (state) => { state.isLoading = true })
            .addCase(loadTodos.fulfilled, (state, action) => {
                state.isLoading = false
                state.todos = action.payload
            })
            .addCase(addTodo.fulfilled, (state, action) => {
                state.todos.push(action.payload)
            })
            .addCase(updateTodo.fulfilled, (state, action) => {
                const idx = state.todos.findIndex(t => t.id === action.payload.id)
                if (idx !== -1) state.todos[idx] = action.payload
            })
            .addCase(removeTodo.fulfilled, (state, action) => {
                state.todos = state.todos.filter(t => t.id !== action.payload)
            })
    }
})

export default todoSlice.reducer