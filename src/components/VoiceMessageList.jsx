/**
 * Optimized Message List Component with Virtual Scrolling
 * 
 * Implements virtual scrolling for long message lists to improve performance.
 * Only renders visible messages, reducing DOM nodes and memory usage.
 * 
 * @module VoiceMessageList
 */

import React, { memo, useMemo, useRef, useEffect, useCallback } from 'react';

/**
 * Virtual scrolling message list component
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {Function} props.renderMessage - Function to render a message
 * @param {number} props.itemHeight - Estimated height of each message
 * @param {number} props.overscan - Number of items to render outside viewport
 */
const VoiceMessageList = memo(({
  messages = [],
  renderMessage,
  itemHeight = 100,
  overscan = 3,
  className = ''
}) => {
  const containerRef = useRef(null);
  const scrollTopRef = useRef(0);
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 10 });

  // Calculate visible range
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      messages.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    setVisibleRange({ start, end });
  }, [messages.length, itemHeight, overscan]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    scrollTopRef.current = containerRef.current.scrollTop;
    calculateVisibleRange();
  }, [calculateVisibleRange]);

  // Initial calculation
  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange, messages.length]);

  // Memoized visible messages
  const visibleMessages = useMemo(() => {
    return messages.slice(visibleRange.start, visibleRange.end);
  }, [messages, visibleRange.start, visibleRange.end]);

  // Calculate offsets
  const offsetY = visibleRange.start * itemHeight;
  const totalHeight = messages.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`voice-message-list ${className}`}
      onScroll={handleScroll}
      style={{
        height: '100%',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {/* Spacer for items above viewport */}
      <div style={{ height: offsetY }} />

      {/* Visible messages */}
      <div className="voice-message-list-items">
        {visibleMessages.map((message, index) => {
          const actualIndex = visibleRange.start + index;
          return (
            <div key={message.id || actualIndex} className="voice-message-list-item">
              {renderMessage(message, actualIndex)}
            </div>
          );
        })}
      </div>

      {/* Spacer for items below viewport */}
      <div style={{ height: Math.max(0, totalHeight - offsetY - visibleMessages.length * itemHeight) }} />
    </div>
  );
});

VoiceMessageList.displayName = 'VoiceMessageList';

export default VoiceMessageList;

