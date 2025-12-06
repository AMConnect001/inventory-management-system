<?php

namespace App\Services;

class LocationHierarchyService
{
    /**
     * Location hierarchy mapping
     * Each location type can only send to specific destination types
     */
    private const HIERARCHY = [
        'warehouse' => ['distributor'],
        'distributor' => ['sales_agent'],
        'sales_agent' => ['store'],
        'store' => [],
    ];

    /**
     * Check if a location type can send to another location type
     */
    public function canSendTo(string $fromType, string $toType): bool
    {
        $allowedTypes = $this->getAllowedDestinationTypes($fromType);
        return in_array($toType, $allowedTypes);
    }

    /**
     * Get allowed destination types for a source location type
     */
    public function getAllowedDestinationTypes(string $fromType): array
    {
        return self::HIERARCHY[$fromType] ?? [];
    }

    /**
     * Validate movement hierarchy
     */
    public function validateMovement(string $fromType, string $toType): array
    {
        if ($fromType === $toType) {
            return [
                'valid' => false,
                'error' => 'Source and destination locations must be different',
            ];
        }

        if (!$this->canSendTo($fromType, $toType)) {
            return [
                'valid' => false,
                'error' => ucfirst(str_replace('_', ' ', $fromType)) . ' cannot send stock to ' . ucfirst(str_replace('_', ' ', $toType)),
                'allowedTypes' => $this->getAllowedDestinationTypes($fromType),
            ];
        }

        return ['valid' => true];
    }
}

