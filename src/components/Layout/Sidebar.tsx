import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot,
  FolderLock, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  CheckSquare, 
  History,
  Lock,
  Shield,
  User
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type NavTab = 
  | 'dashboard'
  | 'agent'
  | 'vault'
  | 'verification'
  | 'opportunities'
  | 'applications'
  | 'approval'
  | 'audit'
  | 'history'
  | 'privacy'
  | 'profile';

interface SidebarProps {
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  issueCount: number;
  pendingApprovalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  issueCount,
  pendingApprovalCount
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const currentPathSegment = location.pathname.split('/')[1] || 'dashboard';

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      route: '/dashboard',
      label: t.navDashboard,
      icon: LayoutDashboard
    },
    {
      id: 'agent' as NavTab,
      route: '/agent',
      label: t.navAgent,
      icon: Bot,
      badge: 'Core',
      badgeType: 'info'
    },
    {
      id: 'vault' as NavTab,
      route: '/vault',
      label: t.navVault,
      icon: FolderLock
    },
    {
      id: 'verification' as NavTab,
      route: '/verification',
      label: t.navVerification,
      icon: ShieldAlert,
      badge: issueCount > 0 ? `${issueCount} Issue` : undefined,
      badgeType: 'warning'
    },
    {
      id: 'opportunities' as NavTab,
      route: '/opportunities',
      label: t.navOpportunities,
      icon: Sparkles
    },
    {
      id: 'applications' as NavTab,
      route: '/applications',
      label: t.navApplications,
      icon: FileText
    },
    {
      id: 'approval' as NavTab,
      route: '/approval',
      label: t.navApproval,
      icon: CheckSquare,
      badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} Pending` : undefined,
      badgeType: 'info'
    },
    {
      id: 'audit' as NavTab,
      route: '/audit',
      label: t.navAudit,
      icon: History
    },
    {
      id: 'history' as NavTab,
      route: '/history',
      label: t.navHistory,
      icon: History
    },
    {
      id: 'privacy' as NavTab,
      route: '/privacy',
      label: t.navPrivacy,
      icon: Shield
    },
    {
      id: 'profile' as NavTab,
      route: '/profile',
      label: t.navProfile,
      icon: User
    }
  ];

  const handleNavigate = (id: NavTab, route: string) => {
    if (onSelectTab) {
      onSelectTab(id);
    }
    navigate(route);
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      borderRight: '1px solid #1e293b'
    }}>
      {/* Brand Header */}
      <div 
        onClick={() => handleNavigate('dashboard', '/dashboard')}
        style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '18px'
          }}>
            <Lock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              LifeOps AI
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Personal Operations Agent
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          color: '#475569', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          padding: '8px 12px' 
        }}>
          Operations Menu
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPathSegment === item.id || currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id, item.route)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '6px',
                marginBottom: '4px',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#3b82f6' : '#64748b'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: item.badgeType === 'warning' ? '#78350f' : '#1e3a8a',
                  color: item.badgeType === 'warning' ? '#fde68a' : '#bfdbfe',
                  border: `1px solid ${item.badgeType === 'warning' ? '#92400e' : '#1d4ed8'}`
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #1e293b',
        backgroundColor: '#090d16'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          System Status
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            boxShadow: '0 0 8px #22c55e'
          }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0' }}>
            Prototype Operations
          </span>
        </div>
      </div>
    </aside>
  );
};
