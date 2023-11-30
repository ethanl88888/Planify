import React from 'react';
import { useLocation } from 'react-router-dom';

function NewPlan() {
  const location = useLocation();
  const assistantMessage = location.state?.assistantMessage || '';

  return (
    <div id="new-plan">
      {assistantMessage}
    </div>
  )
}

export default NewPlan;

