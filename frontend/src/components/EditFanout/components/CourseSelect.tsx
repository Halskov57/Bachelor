import React from 'react';

interface CourseSelectProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    isAdmin?: boolean;
    mode?: 'edit' | 'create';
}

export const CourseSelect: React.FC<CourseSelectProps> = ({
    value,
    onChange,
    disabled = false,
    isAdmin = false,
    mode = 'edit'
}) => {

    return (
        <React.Fragment>
            <label>Course Level</label>
            <select
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                disabled={disabled || mode === 'edit'}
                style={{ 
                    width: '100%', 
                    marginBottom: '12px',
                    opacity: mode === 'edit' ? 0.6 : 1,
                    cursor: mode === 'edit' ? 'not-allowed' : 'pointer'
                }}
            >
                {/* Show course levels 1-6 first */}
                {[1, 2, 3, 4, 5, 6].map(level => (
                    <option key={level} value={level}>
                        Course Level {level}
                    </option>
                ))}
                {/* Only show "Default Template" option for admins at the end */}
                {isAdmin && mode === 'create' && (
                    <option key={0} value={0}>
                        Default Template
                    </option>
                )}
            </select>
        </React.Fragment>
    );
};