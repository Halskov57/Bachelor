import React from 'react';

interface BasicFormProps {
    title: string;
    description: string;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    disabled?: boolean;
    titleLabel?: string;
    descriptionLabel?: string;
    titlePlaceholder?: string;
    descriptionPlaceholder?: string;
}

export const BasicForm: React.FC<BasicFormProps> = ({
    title,
    description,
    onTitleChange,
    onDescriptionChange,
    disabled = false,
    titleLabel = "Name",
    descriptionLabel = "Description",
    titlePlaceholder = "Enter name",
    descriptionPlaceholder = "Enter description"
}) => {
    return (
        <div>
            <label>{titleLabel}</label>
            <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={titlePlaceholder}
                disabled={disabled}
                style={{ width: '100%', marginBottom: '12px' }}
            />

            <label>{descriptionLabel}</label>
            <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder={descriptionPlaceholder}
                rows={3}
                disabled={disabled}
                style={{ width: '100%', marginBottom: '12px' }}
            />
        </div>
    );
};