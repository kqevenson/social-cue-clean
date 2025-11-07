import React, { useState, useEffect } from 'react';

const VoicePracticeSelection = ({ onNavigate }) => {
  console.log('🎤 VoicePracticeSelection component is rendering!');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff', 
      padding: '2rem' 
    }}>
      <div style={{ 
        background: 'linear-gradient(to right, #2563eb, #10b981)', 
        padding: '1.5rem', 
        borderRadius: '0.5rem',
        marginBottom: '1rem'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Practice
        </h1>
        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          Talk with your AI coach
        </p>
      </div>
      
      <div style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Practice Scenarios
        </h2>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '1.5rem', 
          borderRadius: '0.75rem',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>👋</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Meeting Someone New
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.5rem' }}>
                Practice introducing yourself and starting a friendly conversation
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  background: 'rgba(34,197,94,0.2)', 
                  color: '#4ade80' 
                }}>
                  Beginner
                </span>
                <span style={{ color: '#9ca3af' }}>3-5 min</span>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem' }}>→</div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '1.5rem', 
          borderRadius: '0.75rem',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>👥</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Joining a Group
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.5rem' }}>
                Learn how to approach and join a group conversation
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  background: 'rgba(234,179,8,0.2)', 
                  color: '#facc15' 
                }}>
                  Intermediate
                </span>
                <span style={{ color: '#9ca3af' }}>4-6 min</span>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem' }}>→</div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '1.5rem', 
          borderRadius: '0.75rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🙋</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Asking for Help
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginBottom: '0.5rem' }}>
                Practice asking teachers or peers for assistance
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  background: 'rgba(34,197,94,0.2)', 
                  color: '#4ade80' 
                }}>
                  Beginner
                </span>
                <span style={{ color: '#9ca3af' }}>3-4 min</span>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem' }}>→</div>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(59,130,246,0.1)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(59,130,246,0.3)'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#93c5fd', textAlign: 'center' }}>
            ✨ Click a scenario to start practicing with your AI coach
          </p>
        </div>
      </div>
      
      <div style={{ 
        position: 'fixed',
        bottom: '7rem',
        right: '1rem',
        fontSize: '0.75rem',
        color: '#4b5563',
        background: '#1f2937',
        padding: '0.5rem',
        borderRadius: '0.25rem'
      }}>
        Debug: Component rendered ✅
      </div>
    </div>
  );
};

export default VoicePracticeSelection;
