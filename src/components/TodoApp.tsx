'use client'

import { useState, useEffect } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
}

type Filter = 'all' | 'active' | 'completed'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('todos')
    if (stored) {
      try {
        setTodos(JSON.parse(stored))
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos([...todos, { id: crypto.randomUUID(), text: trimmed, completed: false }])
    setText('')
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const startEditing = (id: string, currentText: string) => {
    setEditingId(id)
    setEditingText(currentText)
  }

  const saveEditing = (id: string) => {
    const trimmed = editingText.trim()
    if (!trimmed) return
    setTodos(todos.map(t => t.id === id ? { ...t, text: trimmed } : t))
    setEditingId(null)
    setEditingText('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingText('')
  }

  const removeTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.completed))
  }

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">Todo List</h1>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          placeholder="接下来要做什么？"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addTodo() }}
        />
        <button className="border rounded px-4" onClick={addTodo}>添加</button>
      </div>
      <ul className="flex flex-col gap-2">
        {filteredTodos.map(todo => (
          <li key={todo.id} className="flex items-center gap-2 border-b py-1">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            {editingId === todo.id ? (
              <>
                <input
                  className="flex-1 border rounded px-1"
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEditing(todo.id); if (e.key === 'Escape') cancelEditing() }}
                  autoFocus
                />
                <button onClick={() => saveEditing(todo.id)} className="text-sm">保存</button>
                <button onClick={cancelEditing} className="text-sm">取消</button>
              </>
            ) : (
              <>
                <span className={todo.completed ? 'line-through flex-1' : 'flex-1'}>{todo.text}</span>
                <button onClick={() => startEditing(todo.id, todo.text)} className="text-sm">编辑</button>
                <button onClick={() => removeTodo(todo.id)} className="text-sm text-red-600">删除</button>
              </>
              )
            </li>
          ))}
      </ul>
      {todos.length > 0 && (
        <div className="flex items-center justify-between text-sm mt-4">
          <span>{todos.filter(t => !t.completed).length} 个未完成项</span>
          <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={filter==='all' ? 'underline' : ''}>全部</button>
            <button onClick={() => setFilter('active')} className={filter==='active' ? 'underline' : ''}>未完成</button>
            <button onClick={() => setFilter('completed')} className={filter==='completed' ? 'underline' : ''}>已完成</button>
          </div>
          <button onClick={clearCompleted} disabled={!todos.some(t => t.completed)} className="text-red-600 disabled:text-gray-400">清除已完成</button>
        </div>
      )}
    </div>
  )
}
