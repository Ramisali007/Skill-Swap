import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { toast } from 'react-toastify';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const NotificationPreferences = () => {
  const { user } = useAuth();
  const { updatePreferences } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Default preferences structure
  const defaultPreferences = {
    email: {
      enabled: true,
      types: {
        projectUpdates: true,
        bidUpdates: true,
        messages: true,
        reviews: true,
        verification: true,
        payments: true,
        marketing: false,
        systemUpdates: true,
        disputes: true
      },
      frequency: 'immediate'
    },
    sms: {
      enabled: false,
      types: {
        projectUpdates: false,
        bidUpdates: false,
        messages: false,
        verification: true,
        payments: false,
        systemUpdates: false,
        disputes: true
      },
      frequency: 'immediate'
    },
    inApp: {
      enabled: true,
      types: {
        projectUpdates: true,
        bidUpdates: true,
        messages: true,
        reviews: true,
        verification: true,
        payments: true,
        systemUpdates: true,
        disputes: true
      }
    }
  };

  const [preferences, setPreferences] = useState(defaultPreferences);

  // Fetch user's notification preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);

        // If user has notification preferences, use them
        if (user && user.notificationPreferences) {
          setPreferences({
            ...defaultPreferences,
            ...user.notificationPreferences
          });
        } else {
          // Otherwise use defaults
          setPreferences(defaultPreferences);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        toast.error('Failed to load notification preferences');
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  // Handle email toggle
  const handleEmailToggle = (e) => {
    setPreferences({
      ...preferences,
      email: {
        ...preferences.email,
        enabled: e.target.checked
      }
    });
  };

  // Handle email type toggle
  const handleEmailTypeToggle = (type) => (e) => {
    setPreferences({
      ...preferences,
      email: {
        ...preferences.email,
        types: {
          ...preferences.email.types,
          [type]: e.target.checked
        }
      }
    });
  };

  // Handle email frequency change
  const handleEmailFrequencyChange = (e) => {
    setPreferences({
      ...preferences,
      email: {
        ...preferences.email,
        frequency: e.target.value
      }
    });
  };

  // Handle SMS toggle
  const handleSmsToggle = (e) => {
    setPreferences({
      ...preferences,
      sms: {
        ...preferences.sms,
        enabled: e.target.checked
      }
    });
  };

  // Handle SMS type toggle
  const handleSmsTypeToggle = (type) => (e) => {
    setPreferences({
      ...preferences,
      sms: {
        ...preferences.sms,
        types: {
          ...preferences.sms.types,
          [type]: e.target.checked
        }
      }
    });
  };

  // Handle SMS frequency change
  const handleSmsFrequencyChange = (e) => {
    setPreferences({
      ...preferences,
      sms: {
        ...preferences.sms,
        frequency: e.target.value
      }
    });
  };

  // Handle in-app toggle
  const handleInAppToggle = (e) => {
    setPreferences({
      ...preferences,
      inApp: {
        ...preferences.inApp,
        enabled: e.target.checked
      }
    });
  };

  // Handle in-app type toggle
  const handleInAppTypeToggle = (type) => (e) => {
    setPreferences({
      ...preferences,
      inApp: {
        ...preferences.inApp,
        types: {
          ...preferences.inApp.types,
          [type]: e.target.checked
        }
      }
    });
  };

  // Save preferences
  const handleSave = async () => {
    try {
      setSaving(true);

      await updatePreferences(preferences);

      setSuccess(true);
      toast.success('Notification preferences saved successfully');

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

      setSaving(false);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save notification preferences');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <BellIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Notification Preferences
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Customize how and when you receive notifications from SkillSwap.
        </p>
      </div>

      <div className="p-6 space-y-8">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <EnvelopeIcon className="h-6 w-6 text-indigo-500 mr-2" />
              <h4 className="text-base font-medium text-gray-900">Email Notifications</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.email.enabled}
                onChange={handleEmailToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {preferences.email.enabled && (
            <>
              <div className="ml-8 space-y-3">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-2">Frequency:</label>
                  <select
                    className="block w-40 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    value={preferences.email.frequency}
                    onChange={handleEmailFrequencyChange}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Notification Types:</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <input
                        id="email-project-updates"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.email.types.projectUpdates}
                        onChange={handleEmailTypeToggle('projectUpdates')}
                      />
                      <label htmlFor="email-project-updates" className="ml-2 block text-sm text-gray-700">
                        Project Updates
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="email-bid-updates"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.email.types.bidUpdates}
                        onChange={handleEmailTypeToggle('bidUpdates')}
                      />
                      <label htmlFor="email-bid-updates" className="ml-2 block text-sm text-gray-700">
                        Bid Updates
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="email-messages"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.email.types.messages}
                        onChange={handleEmailTypeToggle('messages')}
                      />
                      <label htmlFor="email-messages" className="ml-2 block text-sm text-gray-700">
                        Messages
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="email-reviews"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.email.types.reviews}
                        onChange={handleEmailTypeToggle('reviews')}
                      />
                      <label htmlFor="email-reviews" className="ml-2 block text-sm text-gray-700">
                        Reviews
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="email-verification"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.email.types.verification}
                        onChange={handleEmailTypeToggle('verification')}
                      />
                      <label htmlFor="email-verification" className="ml-2 block text-sm text-gray-700">
                        Account Verification
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="email-disputes"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.email.types.disputes}
                        onChange={handleEmailTypeToggle('disputes')}
                      />
                      <label htmlFor="email-disputes" className="ml-2 block text-sm text-gray-700">
                        Disputes
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="email-payments"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.email.types.payments}
                        onChange={handleEmailTypeToggle('payments')}
                      />
                      <label htmlFor="email-payments" className="ml-2 block text-sm text-gray-700">
                        Payments
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="email-marketing"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.email.types.marketing}
                        onChange={handleEmailTypeToggle('marketing')}
                      />
                      <label htmlFor="email-marketing" className="ml-2 block text-sm text-gray-700">
                        Marketing & Promotions
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="email-system-updates"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.email.types.systemUpdates}
                        onChange={handleEmailTypeToggle('systemUpdates')}
                      />
                      <label htmlFor="email-system-updates" className="ml-2 block text-sm text-gray-700">
                        System Updates
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* SMS Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DevicePhoneMobileIcon className="h-6 w-6 text-indigo-500 mr-2" />
              <h4 className="text-base font-medium text-gray-900">SMS Notifications</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.sms.enabled}
                onChange={handleSmsToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {preferences.sms.enabled && (
            <>
              <div className="ml-8 space-y-3">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-2">Frequency:</label>
                  <select
                    className="block w-40 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    value={preferences.sms.frequency}
                    onChange={handleSmsFrequencyChange}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Digest</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Notification Types:</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <input
                        id="sms-project-updates"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.sms.types.projectUpdates}
                        onChange={handleSmsTypeToggle('projectUpdates')}
                      />
                      <label htmlFor="sms-project-updates" className="ml-2 block text-sm text-gray-700">
                        Project Updates
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="sms-bid-updates"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.sms.types.bidUpdates}
                        onChange={handleSmsTypeToggle('bidUpdates')}
                      />
                      <label htmlFor="sms-bid-updates" className="ml-2 block text-sm text-gray-700">
                        Bid Updates
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="sms-messages"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.sms.types.messages}
                        onChange={handleSmsTypeToggle('messages')}
                      />
                      <label htmlFor="sms-messages" className="ml-2 block text-sm text-gray-700">
                        Messages
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="sms-verification"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.sms.types.verification}
                        onChange={handleSmsTypeToggle('verification')}
                      />
                      <label htmlFor="sms-verification" className="ml-2 block text-sm text-gray-700">
                        Account Verification
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="sms-disputes"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.sms.types.disputes}
                        onChange={handleSmsTypeToggle('disputes')}
                      />
                      <label htmlFor="sms-disputes" className="ml-2 block text-sm text-gray-700">
                        Disputes
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="sms-payments"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.sms.types.payments}
                        onChange={handleSmsTypeToggle('payments')}
                      />
                      <label htmlFor="sms-payments" className="ml-2 block text-sm text-gray-700">
                        Payments
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="sms-system-updates"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={preferences.sms.types.systemUpdates}
                        onChange={handleSmsTypeToggle('systemUpdates')}
                      />
                      <label htmlFor="sms-system-updates" className="ml-2 block text-sm text-gray-700">
                        System Updates
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* In-App Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BellIcon className="h-6 w-6 text-indigo-500 mr-2" />
              <h4 className="text-base font-medium text-gray-900">In-App Notifications</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences.inApp.enabled}
                onChange={handleInAppToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {preferences.inApp.enabled && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Notification Types:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <input
                      id="inapp-project-updates"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={preferences.inApp.types.projectUpdates}
                      onChange={handleInAppTypeToggle('projectUpdates')}
                    />
                    <label htmlFor="inapp-project-updates" className="ml-2 block text-sm text-gray-700">
                      Project Updates
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="inapp-bid-updates"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={preferences.inApp.types.bidUpdates}
                      onChange={handleInAppTypeToggle('bidUpdates')}
                    />
                    <label htmlFor="inapp-bid-updates" className="ml-2 block text-sm text-gray-700">
                      Bid Updates
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="inapp-messages"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={preferences.inApp.types.messages}
                      onChange={handleInAppTypeToggle('messages')}
                    />
                    <label htmlFor="inapp-messages" className="ml-2 block text-sm text-gray-700">
                      Messages
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="inapp-reviews"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={preferences.inApp.types.reviews}
                      onChange={handleInAppTypeToggle('reviews')}
                    />
                    <label htmlFor="inapp-reviews" className="ml-2 block text-sm text-gray-700">
                      Reviews
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="inapp-verification"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={preferences.inApp.types.verification}
                      onChange={handleInAppTypeToggle('verification')}
                    />
                    <label htmlFor="inapp-verification" className="ml-2 block text-sm text-gray-700">
                      Account Verification
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="inapp-disputes"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={preferences.inApp.types.disputes}
                      onChange={handleInAppTypeToggle('disputes')}
                    />
                    <label htmlFor="inapp-disputes" className="ml-2 block text-sm text-gray-700">
                      Disputes
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="inapp-payments"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={preferences.inApp.types.payments}
                      onChange={handleInAppTypeToggle('payments')}
                    />
                    <label htmlFor="inapp-payments" className="ml-2 block text-sm text-gray-700">
                      Payments
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="inapp-system-updates"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={preferences.inApp.types.systemUpdates}
                      onChange={handleInAppTypeToggle('systemUpdates')}
                    />
                    <label htmlFor="inapp-system-updates" className="ml-2 block text-sm text-gray-700">
                      System Updates
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          {success && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">Preferences saved</span>
            </div>
          )}

          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
