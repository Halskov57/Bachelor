import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

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
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">{titleLabel}</Label>
                <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder={titlePlaceholder}
                    disabled={disabled}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">{descriptionLabel}</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder={descriptionPlaceholder}
                    rows={3}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};