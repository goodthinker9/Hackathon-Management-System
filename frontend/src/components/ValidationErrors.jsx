import React from 'react';

export default function ValidationErrors({ errors = [] }) {
  if (!errors.length) return null;
  return (
    <ul className="validation-errors" role="alert">
      {errors.map((error, index) => (
        <li key={`${error.field}-${index}`}>
          {error.field ? `${error.field}: ` : ''}{error.message}
        </li>
      ))}
    </ul>
  );
}
