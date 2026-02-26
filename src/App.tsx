import { useState, useEffect } from 'react' 
import { storageService } from './services/async-storage.service'
import type { Todo } from './types/todo'
import { Trash2, Edit2, Plus, Check } from 'lucide-react'

const TODO_KEY = 'todo_db'

export default function App() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [newTaskText, setNewTaskText] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editText, setEditText] = useState('')

    useEffect(() => {
    let ignore = false
    storageService.query<Todo>(TODO_KEY)
        .then(data => { if (!ignore) setTodos(data) })
        .catch(err => console.error('Had issues loading todos', err))
    return () => { ignore = true }
}, [])

    // Create
    async function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        if (!newTaskText.trim()) return

        const newTodo = { text: newTaskText, isDone: false }
        const savedTodo = await storageService.post<typeof newTodo>(TODO_KEY, newTodo)
        
        setTodos(prev => [...prev, savedTodo])
        setNewTaskText('')
    }

    // Update (Edit Text)
    async function handleSaveEdit(todo: Todo) {
        if (!editText.trim()) {
            setEditingId(null)
            return
        }
        const updatedTodo = { ...todo, text: editText }
        const saved = await storageService.put<Todo>(TODO_KEY, updatedTodo)
        
        setTodos(prev => prev.map(t => t.id === saved.id ? saved : t))
        setEditingId(null)
    }

    // Update (Toggle Done)
    async function handleToggleDone(todo: Todo) {
        const updatedTodo = { ...todo, isDone: !todo.isDone }
        const saved = await storageService.put<Todo>(TODO_KEY, updatedTodo)
        setTodos(prev => prev.map(t => t.id === saved.id ? saved : t))
    }

    // Delete
    async function handleRemove(id: string) {
        await storageService.remove(TODO_KEY, id)
        setTodos(prev => prev.filter(t => t.id !== id))
    }

    function startEditing(todo: Todo) {
        setEditingId(todo.id)
        setEditText(todo.text)
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-slate-800">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                <h1 className="text-2xl font-bold text-center mb-6">Minimal Tasker</h1>

                <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                    >
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
                                    onChange={() => handleToggleDone(todo)}
                                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                                />
                                
                                {editingId === todo.id ? (
                                    <input 
                                        type="text"
                                        autoFocus
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onBlur={() => handleSaveEdit(todo)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(todo)}
                                        className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none"
                                    />
                                ) : (
                                    <span 
                                        className={`flex-1 truncate ${todo.isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}
                                        onDoubleClick={() => startEditing(todo)}
                                    >
                                        {todo.text}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {editingId === todo.id ? (
                                    <button onClick={() => handleSaveEdit(todo)} className="text-green-500 hover:text-green-600 p-1">
                                        <Check size={18} />
                                    </button>
                                ) : (
                                    <button onClick={() => startEditing(todo)} className="text-slate-400 hover:text-blue-500 p-1">
                                        <Edit2 size={18} />
                                    </button>
                                )}
                                <button onClick={() => handleRemove(todo.id)} className="text-slate-400 hover:text-red-500 p-1">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                        </div>
                    ))}

                    {todos.length === 0 && (
                        <p className="text-center text-slate-400 text-sm mt-8">Your list is empty. Add a task above.</p>
                    )}
                </div>
            </div>
        </div>
    )
}