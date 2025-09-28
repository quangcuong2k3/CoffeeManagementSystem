'use client';

import { Navigation } from '@/shared/components';
import { Settings, Save, User, Shield, Palette, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Switch } from '../../shared/ui/switch';
import { useState } from 'react';

function SettingsPageContent() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and system preferences
          </p>
        </div>
        <Button className="btn-coffee shadow-lg">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            System Settings
          </h3>
          <div className="text-center py-8">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Settings configuration coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Navigation>
      <SettingsPageContent />
    </Navigation>
  );
}
