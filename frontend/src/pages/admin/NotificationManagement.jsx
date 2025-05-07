import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { BellIcon, CalendarIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import NotificationTemplateManager from '../../components/admin/NotificationTemplateManager';
import ScheduledNotificationsManager from '../../components/admin/ScheduledNotificationsManager';
import DisputeTemplateCreator from '../../components/admin/DisputeTemplateCreator';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const NotificationManagement = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:px-8 relative z-10">
          <div className="absolute inset-0 bg-white opacity-5 z-0"></div>
          <div className="relative z-10">
            <h2 className="text-2xl leading-8 font-bold text-white flex items-center">
              <BellIcon className="h-8 w-8 mr-3 text-indigo-200" />
              Notification Management
            </h2>
            <p className="mt-2 max-w-2xl text-indigo-100">
              Manage notification templates, scheduled notifications, and create specialized templates for the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex bg-gradient-to-r from-indigo-700 to-purple-700 p-1 space-x-1 rounded-t-xl">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-3 text-sm leading-5 font-medium rounded-lg',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60',
                  selected
                    ? 'bg-white shadow text-indigo-700'
                    : 'text-white hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              <div className="flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Templates
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-3 text-sm leading-5 font-medium rounded-lg',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60',
                  selected
                    ? 'bg-white shadow text-indigo-700'
                    : 'text-white hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              <div className="flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Scheduled
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full py-3 text-sm leading-5 font-medium rounded-lg',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60',
                  selected
                    ? 'bg-white shadow text-indigo-700'
                    : 'text-white hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              <div className="flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Dispute Templates
              </div>
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel className="p-4">
              <NotificationTemplateManager />
            </Tab.Panel>
            <Tab.Panel className="p-4">
              <ScheduledNotificationsManager />
            </Tab.Panel>
            <Tab.Panel className="p-4">
              <DisputeTemplateCreator />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default NotificationManagement;
