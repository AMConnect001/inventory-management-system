<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'in:super_admin,warehouse_manager,distributor,sales_agent,store_manager'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
        ];
    }
}

