'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Store,
  Bell,
  Shield,
  CreditCard,
  Database,
  Mail,
  Smartphone,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      storeName: 'The Coffee House',
      storeDescription: 'Premium coffee and pastries',
      address: '123 Main Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'contact@coffeehouse.com',
      website: 'https://coffeehouse.com',
      timezone: 'America/New_York',
      currency: 'USD'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      lowStockAlerts: true,
      newOrderAlerts: true,
      dailyReports: true,
      weeklyReports: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordRequirements: true,
      apiAccessEnabled: false
    },
    payment: {
      enableCreditCard: true,
      enableDebitCard: true,
      enableCash: true,
      enableMobilePayments: true,
      taxRate: 8.5,
      tipSuggestions: [15, 18, 20, 25]
    }
  });

  const handleSave = () => {
    // Simulate saving settings
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your coffee shop management system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                Basic information about your coffee shop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={settings.general.storeName}
                    onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={settings.general.currency}
                    onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Description</Label>
                <Input
                  id="storeDescription"
                  value={settings.general.storeDescription}
                  onChange={(e) => handleInputChange('general', 'storeDescription', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.general.address}
                  onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.general.phone}
                    onChange={(e) => handleInputChange('general', 'phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.general.email}
                    onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.general.website}
                  onChange={(e) => handleInputChange('general', 'website', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'pushNotifications', checked)}
                  />
                </div>
              </div>

              <hr className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Alert Types</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-gray-600">When inventory is running low</p>
                  </div>
                  <Switch
                    checked={settings.notifications.lowStockAlerts}
                    onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'lowStockAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Order Alerts</Label>
                    <p className="text-sm text-gray-600">When new orders are placed</p>
                  </div>
                  <Switch
                    checked={settings.notifications.newOrderAlerts}
                    onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'newOrderAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-gray-600">Daily business summary</p>
                  </div>
                  <Switch
                    checked={settings.notifications.dailyReports}
                    onCheckedChange={(checked: boolean) => handleInputChange('notifications', 'dailyReports', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security options for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked: boolean) => handleInputChange('security', 'twoFactorAuth', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Strong Password Requirements</Label>
                  <p className="text-sm text-gray-600">Enforce strong password policies</p>
                </div>
                <Switch
                  checked={settings.security.passwordRequirements}
                  onCheckedChange={(checked: boolean) => handleInputChange('security', 'passwordRequirements', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API Access</Label>
                  <p className="text-sm text-gray-600">Enable API access for integrations</p>
                </div>
                <Switch
                  checked={settings.security.apiAccessEnabled}
                  onCheckedChange={(checked: boolean) => handleInputChange('security', 'apiAccessEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure payment methods and options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Accepted Payment Methods</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Credit Cards</Label>
                    <Switch
                      checked={settings.payment.enableCreditCard}
                      onCheckedChange={(checked: boolean) => handleInputChange('payment', 'enableCreditCard', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Debit Cards</Label>
                    <Switch
                      checked={settings.payment.enableDebitCard}
                      onCheckedChange={(checked: boolean) => handleInputChange('payment', 'enableDebitCard', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Cash</Label>
                    <Switch
                      checked={settings.payment.enableCash}
                      onCheckedChange={(checked: boolean) => handleInputChange('payment', 'enableCash', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Mobile Payments</Label>
                    <Switch
                      checked={settings.payment.enableMobilePayments}
                      onCheckedChange={(checked: boolean) => handleInputChange('payment', 'enableMobilePayments', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  value={settings.payment.taxRate}
                  onChange={(e) => handleInputChange('payment', 'taxRate', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tip Suggestions (%)</Label>
                <div className="flex gap-2">
                  {settings.payment.tipSuggestions.map((tip, index) => (
                    <Badge key={index} variant="outline">{tip}%</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Backup, restore, and manage your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Backup & Restore</h4>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Backup
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Restore from Backup
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Data Synchronization</h4>
                  <Button className="w-full" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync with Firebase
                  </Button>
                  <p className="text-sm text-gray-600">
                    Last sync: 2 hours ago
                  </p>
                </div>
              </div>

              <hr className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <div className="border border-red-200 rounded-lg p-4 space-y-4">
                  <div>
                    <h5 className="font-medium">Clear All Data</h5>
                    <p className="text-sm text-gray-600">
                      This will permanently delete all your data. This action cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive">
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
