<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');
        
        return [
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['sometimes', 'string', 'min:6'],
            'name' => ['sometimes', 'string', 'max:255'],
            'role' => ['sometimes', 'in:super_admin,warehouse_manager,distributor,sales_agent,store_manager'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
        ];
    }
}

