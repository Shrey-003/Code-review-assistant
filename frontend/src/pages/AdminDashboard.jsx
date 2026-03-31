import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', difficulty: 'Easy', tags: '', testCases: [{ input: '', expectedOutput: '' }]
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = () => {
    setLoading(true);
    // Fetch all without pagination limit for admin view
    api.getProblems()
      .then(data => setProblems(Array.isArray(data) ? data : data.problems || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleEdit = async (problem) => {
    try {
      // Need to fetch full problem with test cases before editing
      const fullProblem = await api.getProblem(problem._id);
      
      setFormData({
        title: fullProblem.title,
        description: fullProblem.description,
        difficulty: fullProblem.difficulty,
        tags: fullProblem.tags ? fullProblem.tags.join(', ') : '',
        testCases: fullProblem.testCases || [{ input: '', expectedOutput: '' }]
      });
      setEditingId(fullProblem._id);
      setFormError('');
      document.getElementById('admin-form').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert("Failed to fetch full problem data for editing.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to completely delete this problem?")) {
      await api.deleteProblem(id);
      fetchProblems();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        testCases: formData.testCases.filter(tc => tc.input && tc.expectedOutput)
      };

      if (payload.testCases.length === 0) {
         throw new Error("At least one valid test case is required");
      }

      if (editingId) {
        await api.editProblem(editingId, payload);
      } else {
        await api.createProblem(payload);
      }
      
      // Reset form on success
      setFormData({ title: '', description: '', difficulty: 'Easy', tags: '', testCases: [{ input: '', expectedOutput: '' }] });
      setEditingId(null);
      fetchProblems();
      
    } catch (err) {
      setFormError(err.message || "Failed to save problem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', expectedOutput: '' }]
    });
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...formData.testCases];
    updated[index][field] = value;
    setFormData({ ...formData, testCases: updated });
  };

  const removeTestCase = (index) => {
    const updated = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: updated.length ? updated : [{ input: '', expectedOutput: '' }] });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', difficulty: 'Easy', tags: '', testCases: [{ input: '', expectedOutput: '' }] });
    setFormError('');
  };

  if (!user || user.role !== 'admin') {
    return <div className="page"><div className="container"><h2>Access Denied</h2><p>You must be an admin to view this page.</p></div></div>;
  }

  return (
    <div className="page admin-page fade-in">
      <div className="container">
        <div className="page-header">
          <h1>🛠️ Admin Dashboard</h1>
          <p>Manage problems, test cases, and tags</p>
        </div>

        <div className="admin-grid">
          {/* Form Side */}
          <div className="admin-panel form-panel" id="admin-form">
            <h2>{editingId ? 'Edit Problem' : 'Create New Problem'}</h2>
            
            {formError && <div className="alert alert-error">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="problem-form">
              <div className="input-group">
                <label>Problem Title</label>
                <input required type="text" className="input" placeholder="e.g. Reverse Linked List" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="input-group-row">
                <div className="input-group flex-1">
                  <label>Difficulty</label>
                  <select className="input" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="input-group flex-2">
                  <label>Tags (comma separated)</label>
                  <input type="text" className="input" placeholder="Array, Math, String" 
                    value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label>Description (Supports HTML)</label>
                <textarea required className="input textarea" rows="6" placeholder="<p>Problem description here...</p>"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="test-cases-section">
                <div className="section-header">
                  <label>Test Cases (Hidden from users)</label>
                  <button type="button" onClick={addTestCase} className="btn btn-sm btn-secondary">+ Add Test Case</button>
                </div>
                
                {formData.testCases.map((tc, index) => (
                  <div key={index} className="test-case-editor">
                    <div className="tc-header">
                      <span>Test Case {index + 1}</span>
                      <button type="button" onClick={() => removeTestCase(index)} className="btn-icon text-error" title="Remove">✕</button>
                    </div>
                    <div className="tc-body">
                      <div className="input-group">
                        <label>Standard Input</label>
                        <textarea required className="input tc-input" rows="2" 
                          value={tc.input} onChange={e => updateTestCase(index, 'input', e.target.value)} />
                      </div>
                      <div className="input-group">
                        <label>Expected Standard Output</label>
                        <textarea required className="input tc-input" rows="2" 
                          value={tc.expectedOutput} onChange={e => updateTestCase(index, 'expectedOutput', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="btn btn-secondary">Cancel</button>
                )}
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Problem' : 'Create Problem')}
                </button>
              </div>
            </form>
          </div>

          {/* List Side */}
          <div className="admin-panel list-panel">
            <h2>Existing Problems</h2>
            {loading ? <div className="spinner"></div> : (
              <div className="admin-problem-list">
                {problems.length === 0 ? <p className="text-muted">No problems found.</p> : null}
                {problems.map(problem => (
                  <div key={problem._id} className="admin-problem-item">
                    <div className="p-info">
                      <strong>{problem.title}</strong>
                      <span className={`badge badge-${problem.difficulty} badge-sm`}>{problem.difficulty}</span>
                    </div>
                    <div className="p-actions">
                      <button onClick={() => handleEdit(problem)} className="btn btn-sm btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(problem._id)} className="btn btn-sm bg-error text-white">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
