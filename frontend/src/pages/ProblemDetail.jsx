import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import './ProblemDetail.css';

const LANG_MAP = {
  javascript: { monaco: 'javascript', label: 'JavaScript' },
  python: { monaco: 'python', label: 'Python' },
  java: { monaco: 'java', label: 'Java' },
  cpp: { monaco: 'cpp', label: 'C++' },
  c: { monaco: 'c', label: 'C' },
};

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [templates, setTemplates] = useState({});
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your solution here\n');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [mySubmissions, setMySubmissions] = useState([]);
  
  // AI State
  const [aiReview, setAiReview] = useState(null);
  const [askingAi, setAskingAi] = useState(false);

  useEffect(() => {
    if (activeTab === 'submissions' && user) {
      api.getSubmissions()
        .then(data => {
           const allSubs = Array.isArray(data) ? data : data.submissions || [];
           setMySubmissions(allSubs.filter(s => s.problem?._id === id || s.problem === id));
        });
    }
  }, [activeTab, id, user]);

  useEffect(() => {
    Promise.all([api.getProblem(id), api.getTemplates().catch(() => [])])
      .then(([prob, tmpl]) => {
        const p = prob.problem || prob;
        setProblem(p);
        const templateMap = {};
        (Array.isArray(tmpl) ? tmpl : tmpl.templates || []).forEach(t => {
          templateMap[t.language] = t.template || t.boilerplate || '';
        });
        setTemplates(templateMap);
        // Load draft if it exists, otherwise use template
        const savedDraft = localStorage.getItem(`draft-${id}-${language}`);
        if (savedDraft) {
          setCode(savedDraft);
        } else if (templateMap[language]) {
          setCode(templateMap[language]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]); // Note: running on id change only to fetch templates once

  const handleLangChange = (lang) => {
    setLanguage(lang);
    const savedDraft = localStorage.getItem(`draft-${id}-${lang}`);
    if (savedDraft) {
      setCode(savedDraft);
    } else if (templates[lang]) {
      setCode(templates[lang]);
    } else {
      setCode('');
    }
  };

  const handleCodeChange = (val) => {
    const newCode = val || '';
    setCode(newCode);
    localStorage.setItem(`draft-${id}-${language}`, newCode);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your code to the default template? You will lose your current draft.")) {
      const defaultCode = templates[language] || '';
      setCode(defaultCode);
      localStorage.removeItem(`draft-${id}-${language}`);
    }
  };

  const handleRun = async () => {
    if (!user) { setOutput({ error: 'Please login to run code' }); return; }
    setRunning(true);
    setOutput(null);
    setActiveTab('output');
    try {
      const res = await api.runProblem(id, { code, language });
      setOutput(res);
    } catch (err) {
      setOutput({ error: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    // ... logic remains but adding AI functions below ...
    if (!user) { setOutput({ error: 'Please login to submit' }); return; }
    setSubmitting(true);
    setOutput(null);
    setActiveTab('output');
    try {
      const res = await api.submitProblem(id, { code, language });
      setOutput(res);
    } catch (err) {
      setOutput({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    if (!user) { setAiReview("Please login to ask the AI Assistant."); setActiveTab('ai'); return; }
    setAskingAi(true);
    setAiReview(null);
    setActiveTab('ai');
    try {
      const res = await api.reviewCode({ problemId: id, code, language });
      setAiReview(res.review);
    } catch (err) {
      setAiReview("❌ Failed to contact the AI Assistant. " + err.message);
    } finally {
      setAskingAi(false);
    }
  };

  const handleExplainError = async (errorOutput) => {
    if (!user) { setAiReview("Please login to ask the AI Assistant."); setActiveTab('ai'); return; }
    setAskingAi(true);
    setAiReview(null);
    setActiveTab('ai');
    try {
      const res = await api.reviewCode({ problemId: id, code, language, errorOutput });
      setAiReview(res.review);
    } catch (err) {
      setAiReview("❌ Failed to contact the AI Assistant. " + err.message);
    } finally {
      setAskingAi(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!problem) return <div className="loading-page"><p>Problem not found</p></div>;

  return (
    <div className="problem-page fade-in">
      <div className="problem-split">
        {/* Left panel - Description */}
        <div className="problem-left">
          <div className="problem-header">
            <h1>{problem.title}</h1>
            <span className={`badge badge-${problem.difficulty}`}>{problem.difficulty}</span>
          </div>

          <div className="panel-tabs">
            <button className={`panel-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}>Description</button>
            <button className={`panel-tab ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}>Submissions</button>
            <button className={`panel-tab ${activeTab === 'output' ? 'active' : ''}`}
              onClick={() => setActiveTab('output')}>
              Output {output && <span className="dot"></span>}
            </button>
            <button className={`panel-tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')} style={{ color: '#c084fc' }}>
              🤖 Assistant {aiReview && !askingAi && <span className="dot" style={{background:'#c084fc'}}></span>}
            </button>
          </div>

          {activeTab === 'description' ? (
            <div className="problem-desc">
              <div className="desc-text" dangerouslySetInnerHTML={{
                __html: problem.description?.replace(/\n/g, '<br/>') || 'No description available'
              }} />

              {problem.examples?.length > 0 && (
                <div className="examples">
                  <h3>Examples</h3>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="example-card">
                      <div className="example-block">
                        <span className="example-label">Input:</span>
                        <pre>{ex.input}</pre>
                      </div>
                      <div className="example-block">
                        <span className="example-label">Output:</span>
                        <pre>{ex.output}</pre>
                      </div>
                      {ex.explanation && (
                        <div className="example-block">
                          <span className="example-label">Explanation:</span>
                          <p>{ex.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints && (
                <div className="constraints">
                  <h3>Constraints</h3>
                  <pre>{problem.constraints}</pre>
                </div>
              )}
            </div>
          ) : activeTab === 'submissions' ? (
            <div className="output-panel" style={{ padding: '16px' }}>
              {!user ? (
                <div className="output-empty"><p>Please login to view submissions</p></div>
              ) : mySubmissions.length === 0 ? (
                <div className="output-empty"><p>You have no submissions for this problem yet.</p></div>
              ) : (
                <div className="submissions-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mySubmissions.slice().reverse().map(sub => (
                    <div key={sub._id} style={{ 
                      padding: '12px', 
                      borderRadius: '8px', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderLeft: `4px solid ${sub.verdict === 'Accepted' ? '#10b981' : '#f43f5e'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ color: sub.verdict === 'Accepted' ? '#10b981' : '#f43f5e' }}>{sub.verdict}</strong>
                        <small style={{ color: '#888' }}>{new Date(sub.createdAt).toLocaleString()}</small>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>Language: {sub.language}</span>
                        <span>Time: {sub.executionTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'ai' ? (
            <div className="output-panel" style={{ padding: '20px', lineHeight: '1.6' }}>
              {askingAi ? (
                <div className="output-empty">
                  <span style={{ fontSize: '3rem' }}>🤖</span>
                  <p>Thinking... Scanning your code and the problem definition...</p>
                  <div className="spinner" style={{ marginTop: '16px' }}></div>
                </div>
              ) : !aiReview ? (
                <div className="output-empty">
                  <span style={{ fontSize: '3rem' }}>🤖</span>
                  <p>I am your AI coding tutor!</p>
                  <p style={{fontSize: '0.9rem', color: '#888', marginTop: '8px', maxWidth: '300px'}}>Click "Get Hint" to have me review your code, or "Explain Error" if your run fails.</p>
                  <button onClick={handleGetHint} className="btn btn-primary" style={{marginTop: '16px'}}>Review My Code Draft</button>
                </div>
              ) : (
                <div className="ai-response fade-in" style={{ fontSize: '0.95rem' }}>
                  <ReactMarkdown>{aiReview}</ReactMarkdown>
                </div>
              )}
            </div>
          ) : (
            <div className="output-panel">
              {!output ? (
                <div className="output-empty">
                  <span>🖥️</span>
                  <p>Run or submit your code to see results</p>
                </div>
              ) : output.error ? (
                <div className="alert alert-error">
                  {output.error}
                  <button onClick={() => handleExplainError(output.error)} className="btn btn-sm" style={{marginTop: '12px', display: 'block', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff'}}>🤖 Explain Error</button>
                </div>
              ) : (
                <div className="output-results">
                  {output.verdict && (
                    <div className={`verdict ${output.verdict === 'Accepted' ? 'accepted' : 'rejected'}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{output.verdict === 'Accepted' ? '✅' : '❌'} {output.verdict}</span>
                      {output.verdict !== 'Accepted' && (
                         <button onClick={() => handleExplainError(`Verdict: ${output.verdict}\n\nTest results:\n${JSON.stringify(output.results, null, 2)}`)} className="btn btn-sm btn-secondary" style={{ fontSize: '0.8rem', background: '#4c1d95', border:'none', color:'white' }}>🤖 Why did this fail?</button>
                      )}
                    </div>
                  )}
                  {output.results && (
                    <div className="test-results">
                      {output.results.map((r, i) => (
                        <div key={i} className={`test-case ${r.passed ? 'passed' : 'failed'}`}>
                          <span className="tc-icon">{r.passed ? '✓' : '✗'}</span>
                          <span>Test Case {i + 1}</span>
                          {!r.passed && r.expected && (
                            <div className="tc-detail">
                              <small>Expected: {r.expected}</small>
                              <small>Got: {r.actual || r.output}</small>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {output.output && <pre className="raw-output">{output.output}</pre>}
                  {output.stderr && <pre className="raw-output error">{output.stderr}</pre>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel - Editor */}
        <div className="problem-right">
          <div className="editor-toolbar">
            <select value={language} onChange={e => handleLangChange(e.target.value)} className="lang-select">
              {Object.entries(LANG_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <div className="editor-actions">
              <button 
                onClick={handleGetHint} 
                className="btn btn-sm" 
                style={{ background: '#4c1d95', color: '#fff', border: 'none', marginRight: '8px' }} 
                disabled={running || submitting || askingAi} 
                title="Ask the AI for a hint">
                🤖 Get Hint
              </button>
              <button onClick={handleReset} className="btn btn-sm" style={{background: 'transparent', color: '#888', marginRight: '8px'}} disabled={running || submitting} title="Reset to default template">
                🔄 Reset
              </button>
              <button onClick={handleRun} className="btn btn-secondary btn-sm" disabled={running || submitting}>
                {running ? '⏳ Running...' : '▶ Run'}
              </button>
              <button onClick={handleSubmit} className="btn btn-primary btn-sm" disabled={running || submitting}>
                {submitting ? '⏳ Submitting...' : '🚀 Submit'}
              </button>
            </div>
          </div>

          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={LANG_MAP[language]?.monaco || language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
                suggestOnTriggerCharacters: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
