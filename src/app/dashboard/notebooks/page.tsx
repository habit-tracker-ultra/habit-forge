'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Calendar, Target } from 'lucide-react';

interface Notebook {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Task {
  id: string;
  notebook_id: string;
  title: string;
  type: 'yes_no' | 'number';
  target?: number;
  unit?: string;
  schedule_type: string;
  created_at: string;
}

export default function NotebooksPage() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [showCreateNotebook, setShowCreateNotebook] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookDesc, setNewNotebookDesc] = useState('');

  // Task creation state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'yes_no' | 'number'>('yes_no');
  const [newTaskTarget, setNewTaskTarget] = useState('');
  const [newTaskUnit, setNewTaskUnit] = useState('');
  const [newTaskSchedule, setNewTaskSchedule] = useState('day');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      fetchNotebooks();
    };
    checkAuth();
  }, [router]);

  const fetchNotebooks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: notebooksData, error: notebooksError } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (notebooksError) throw notebooksError;

      if (notebooksData && notebooksData.length > 0) {
        const allTasks: Record<string, Task[]> = {};

        for (const notebook of notebooksData) {
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('notebook_id', notebook.id);

          allTasks[notebook.id] = tasksData || [];
        }

        setTasks(allTasks);
      }

      setNotebooks(notebooksData || []);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('notebooks').insert([
        {
          user_id: session.user.id,
          name: newNotebookName,
          description: newNotebookDesc,
        },
      ]);

      if (error) throw error;

      setNewNotebookName('');
      setNewNotebookDesc('');
      setShowCreateNotebook(false);
      fetchNotebooks();
    } catch (error) {
      console.error('Error creating notebook:', error);
      alert('Error creating notebook: ' + error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedNotebook) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const taskData = {
        user_id: session.user.id,
        notebook_id: selectedNotebook,
        title: newTaskTitle,
        type: newTaskType,
        schedule_type: newTaskSchedule,
        target: newTaskType === 'number' ? (newTaskTarget ? parseInt(newTaskTarget) : 0) : null,
        unit: newTaskType === 'number' ? (newTaskUnit || null) : null,
      };

      console.log('Creating task with data:', taskData);

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();

      if (error) {
        console.error('Task creation error:', error);
        alert('Error: ' + error.message);
        return;
      }

      console.log('Task created successfully:', data);

      setNewTaskTitle('');
      setNewTaskType('yes_no');
      setNewTaskTarget('');
      setNewTaskUnit('');
      setNewTaskSchedule('day');
      setShowCreateTask(false);
      await fetchNotebooks();
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Error: ' + String(error));
    }
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    if (confirm('Delete this notebook and all tasks?')) {
      try {
        const { error } = await supabase
          .from('notebooks')
          .delete()
          .eq('id', notebookId);

        if (error) throw error;
        if (selectedNotebook === notebookId) setSelectedNotebook(null);
        fetchNotebooks();
      } catch (error) {
        console.error('Error deleting notebook:', error);
        alert('Error deleting notebook');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Delete this task?')) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;
        fetchNotebooks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading your notebooks...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0' }}>
            📚 Notebooks
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Organize your goals into dedicated notebooks
          </p>
        </div>
        <button
          onClick={() => setShowCreateNotebook(true)}
          className='hf-btn-gold'
          style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}
        >
          <Plus size={16} /> New Notebook
        </button>
      </div>

      {/* Create Notebook Modal */}
      {showCreateNotebook && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '100%' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Create New Notebook</h2>

            <form onSubmit={handleCreateNotebook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>NOTEBOOK NAME</label>
                <input
                  type='text'
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  placeholder='e.g., CAT Preparation, Fitness Goals'
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>DESCRIPTION (Optional)</label>
                <textarea
                  value={newNotebookDesc}
                  onChange={(e) => setNewNotebookDesc(e.target.value)}
                  placeholder='What is this notebook for?'
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type='submit'
                  className='hf-btn-gold'
                  style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 700 }}
                >
                  Create Notebook
                </button>
                <button
                  type='button'
                  onClick={() => setShowCreateNotebook(false)}
                  style={{ flex: 1, padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Notebooks List */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden' }}>
            {notebooks.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <p style={{ fontSize: '14px', margin: 0 }}>No notebooks yet</p>
                <p style={{ fontSize: '12px', margin: '8px 0 0 0' }}>Create your first notebook to get started</p>
              </div>
            ) : (
              notebooks.map((notebook) => (
                <div
                  key={notebook.id}
                  onClick={() => setSelectedNotebook(notebook.id)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: selectedNotebook === notebook.id ? 'var(--bg-elevated)' : 'transparent',
                    borderLeft: selectedNotebook === notebook.id ? '4px solid var(--gold)' : '4px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedNotebook !== notebook.id) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedNotebook !== notebook.id) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>
                        {notebook.name}
                      </h3>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', margin: '0 0 8px 0' }}>
                        {tasks[notebook.id]?.length || 0} tasks
                      </p>
                      {notebook.description && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
                          {notebook.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteNotebook(notebook.id)}
                        style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notebook Details / Tasks */}
        <div>
          {selectedNotebook ? (
            <div>
              {/* Tasks Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0' }}>
                    {notebooks.find((n) => n.id === selectedNotebook)?.name}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                    {tasks[selectedNotebook]?.length || 0} tasks in this notebook
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className='hf-btn-gold'
                  style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}
                >
                  <Plus size={16} /> Add Task
                </button>
              </div>

              {/* Create Task Modal */}
              {showCreateTask && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px', backdropFilter: 'blur(4px)' }}>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Add Task to Notebook</h2>

                    <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Task Title */}
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>TASK TITLE</label>
                        <input
                          type='text'
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder='e.g., Read 50 pages, Write 1000 words'
                          required
                          style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Task Type */}
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>TASK TYPE</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '12px', background: newTaskType === 'yes_no' ? 'rgba(232,168,58,0.1)' : 'transparent', border: '1px solid ' + (newTaskType === 'yes_no' ? 'var(--gold)' : 'var(--border-default)'), borderRadius: '10px', transition: 'all 0.2s ease' }}>
                            <input
                              type='radio'
                              name='taskType'
                              value='yes_no'
                              checked={newTaskType === 'yes_no'}
                              onChange={(e) => setNewTaskType(e.target.value as 'yes_no' | 'number')}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>✓ Yes/No</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '12px', background: newTaskType === 'number' ? 'rgba(232,168,58,0.1)' : 'transparent', border: '1px solid ' + (newTaskType === 'number' ? 'var(--gold)' : 'var(--border-default)'), borderRadius: '10px', transition: 'all 0.2s ease' }}>
                            <input
                              type='radio'
                              name='taskType'
                              value='number'
                              checked={newTaskType === 'number'}
                              onChange={(e) => setNewTaskType(e.target.value as 'yes_no' | 'number')}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>📊 Number</span>
                          </label>
                        </div>
                      </div>

                      {/* Number Tracking Options */}
                      {newTaskType === 'number' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>TARGET</label>
                            <input
                              type='number'
                              value={newTaskTarget}
                              onChange={(e) => setNewTaskTarget(e.target.value)}
                              placeholder='e.g., 50'
                              style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>UNIT</label>
                            <input
                              type='text'
                              value={newTaskUnit}
                              onChange={(e) => setNewTaskUnit(e.target.value)}
                              placeholder='e.g., pages, words'
                              style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Schedule Type */}
                      <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>SCHEDULE</label>
                        <select
                          value={newTaskSchedule}
                          onChange={(e) => setNewTaskSchedule(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box' }}
                        >
                          <option value='day'>Daily</option>
                          <option value='week'>Weekly</option>
                          <option value='month'>Monthly</option>
                          <option value='year'>Yearly</option>
                        </select>
                      </div>

                      {/* Buttons */}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          type='submit'
                          className='hf-btn-gold'
                          style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 700 }}
                        >
                          Add Task
                        </button>
                        <button
                          type='button'
                          onClick={() => setShowCreateTask(false)}
                          style={{ flex: 1, padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tasks List */}
              <div style={{ display: 'grid', gap: '16px' }}>
                {tasks[selectedNotebook] && tasks[selectedNotebook].length > 0 ? (
                  tasks[selectedNotebook].map((task) => (
                    <div key={task.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700, margin: '0 0 8px 0' }}>
                          {task.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {task.type === 'yes_no' ? '✓ Yes/No' : '📊 Number'}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {task.schedule_type}
                          </span>
                          {task.type === 'number' && task.target && (
                            <span style={{ color: 'var(--text-secondary)' }}>
                              Target: {task.target} {task.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', color: 'var(--text-tertiary)' }}>
                    <p style={{ fontSize: '14px', margin: 0 }}>No tasks in this notebook yet</p>
                    <p style={{ fontSize: '12px', margin: '8px 0 0 0' }}>Click "Add Task" to create your first task</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '60px 32px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: '16px', margin: 0 }}>Select a notebook to view and manage tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}