import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from './store/store'
import { loadTodos, addTodo, updateTodo, removeTodo } from './store/todo.slice'
import { Trash2, Edit2, Plus, Check, Loader2 } from 'lucide-react'
import type { Todo } from './types/todo'

export default function App() {
    const { todos, isLoading } = useSelector((state: RootState) => state.todoModule)
    const dispatch = useDispatch<AppDispatch>()

    const [newTaskText, setNewTaskText] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editText, setEditText] = useState('')

    useEffect(() => {
        dispatch(loadTodos())
    }, [dispatch])

    const onAddTodo = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTaskText.trim()) return
        dispatch(addTodo(newTaskText))
        setNewTaskText('')
    }

    const onToggleDone = (todo: Todo) => {
        dispatch(updateTodo({ ...todo, isDone: !todo.isDone }))
    }

    const onSaveEdit = (todo: Todo) => {
        if (!editText.trim()) return setEditingId(null)
        dispatch(updateTodo({ ...todo, text: editText }))
        setEditingId(null)
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Redux Master</h1>
                    {isLoading && <Loader2 className="animate-spin text-blue-500" size={20} />}
                </header>

                <form onSubmit={onAddTodo} className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="What's next?"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                        <Plus size={24} />
                    </button>
                </form>

                <div className="space-y-3">
                    {todos.map(todo => (
                        <div key={todo.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                <input 
                                    type="checkbox" 
                                    checked={todo.isDone}
                                    onChange={() => onToggleDone(todo)}
                                    className="w-5 h-5 cursor-pointer"
                                />
                                {editingId === todo.id ? (
                                    <input 
                                        autoFocus
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onBlur={() => onSaveEdit(todo)}
                                        onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(todo)}
                                        className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 outline-none"
                                    />
                                ) : (
                                    <span className={`flex-1 truncate ${todo.isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                        {todo.text}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingId(todo.id); setEditText(todo.text); }} className="text-slate-400 hover:text-blue-500 p-1">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => dispatch(removeTodo(todo.id))} className="text-slate-400 hover:text-red-500 p-1">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {!isLoading && !todos.length && <p className="text-center text-slate-400 text-sm mt-8">Empty list. Start coding!</p>}
                </div>
            </div>
        </div>
    )
}