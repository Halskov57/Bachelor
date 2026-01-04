import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Shield, LogOut, ChevronRight, Palette, Check, FolderOpen } from 'lucide-react';
import { getApiUrl } from '../config/environment';
import { parseJwt } from '../utils/jwt';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { isAdmin, getCurrentUsername } from '../utils/jwt';
import { themes, applyTheme, getCurrentTheme } from '../utils/themes';

interface Project {
  id: string;
  name: string;
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = getCurrentUsername();
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    // Apply the saved theme on mount
    applyTheme(currentTheme);
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const payload = parseJwt(token);
    const username = payload?.sub;
    if (!username) return;

    fetch(getApiUrl(`/projects/user/${username}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const mappedProjects = Array.isArray(data)
          ? data.map((p: any) => ({
              id: p.projectId || p.id,
              name: p.title || p.name,
            }))
          : [];
        setProjects(mappedProjects);
      })
      .catch(() => setProjects([]));
  };
  
  const handleThemeChange = (themeName: string) => {
    applyTheme(themeName);
    setCurrentTheme(themeName);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || name.slice(0, 2).toUpperCase();
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      visible: true,
    },
    {
      title: 'Admin',
      icon: Shield,
      path: '/admin',
      visible: isAdmin(),
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-xl font-bold text-sidebar-foreground">
          Project Manager
        </h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(item => item.visible)
                .map(item => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={location.pathname === item.path}
                      tooltip={item.title}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {projects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map(project => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      onClick={() => navigate(`/project?id=${project.id}`)}
                      isActive={location.search.includes(`id=${project.id}`)}
                      tooltip={project.name}
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span className="truncate">{project.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  {getUserInitials(username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {username}
                </span>
                <span className="text-xs text-sidebar-foreground/70">
                  {isAdmin() ? 'Admin' : 'User'}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-sidebar-foreground/50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{username}</span>
                <span className="text-xs text-muted-foreground">
                  {isAdmin() ? 'Administrator' : 'User'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {themes.map(theme => (
                  <DropdownMenuItem
                    key={theme.name}
                    onClick={() => handleThemeChange(theme.name)}
                  >
                    {currentTheme === theme.name && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {currentTheme !== theme.name && (
                      <span className="mr-2 w-4" />
                    )}
                    <span>{theme.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
