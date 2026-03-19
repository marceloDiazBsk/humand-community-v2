'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  MessageSquare,
  LayoutGrid,
  Star,
  User,
  ArrowLeft,
  Clock,
  Search,
  Bell,
  Heart,
  ThumbsUp,
  Sparkles,
  MessageCircle,
  ChevronRight,
  Plus,
  Copy,
  CheckCircle2,
  Circle,
  Play,
  Lock,
  X,
  Minus,
  Globe,
  Coffee,
  Menu,
  Apple,
  Smartphone,
  Eye,
  EyeOff,
  TrendingUp,
  Trophy,
  Activity,
  Calendar,
  Clock3,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Post {
  id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  created_at: string;
  reactions: Record<string, number>;
}

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  created_at: string;
  likes: number;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface Community {
  id: string;
  name: string;
  emoji: string;
  members: number;
  joined: boolean;
}

interface Course {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  category: string;
  duration: string;
  rating: number;
  progress: number;
  tags: string[];
  modules: Array<{
    id: string;
    title: string;
    status: 'locked' | 'in_progress' | 'completed';
  }>;
}

interface Benefit {
  id: string;
  name: string;
  brand: string;
  category: string;
  discount: string;
  code: string;
  description: string;
  conditions: string;
  emoji: string;
}

interface RunActivity {
  id: string;
  km: number;
  duration: string;
  activity_date: string;
  created_at: string;
  image_url?: string;
}

interface MoodEntry {
  id: string;
  mood_index: number;
  created_at: string;
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'hace unos momentos';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)}w`;
  return date.toLocaleDateString('es-ES');
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
};

export default function Page() {
  const [screen, setScreen] = useState<'muro' | 'apps' | 'community' | 'app'>('muro');
  const [activeApp, setActiveApp] = useState<
    'bienestar' | 'courses' | 'club' | 'todo' | 'juegos' | 'health' | 'comunidades' | 'finanzas' | 'run'
  >('bienestar');
  const [activeTab, setActiveTab] = useState<'muro' | 'apps' | 'community' | 'nuestra' | 'perfil'>('muro');

  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [todos, setTodos] = useState<Todo[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [runActivities, setRunActivities] = useState<RunActivity[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const [courseTab, setCourseTab] = useState<'todos' | 'tech' | 'soft' | 'en-curso'>('todos');
  const [clubFilter, setClubFilter] = useState<'todos' | 'gastronomia' | 'cine' | 'shopping'>('todos');
  const [runTab, setRunTab] = useState<'dashboard' | 'cargar' | 'ranking' | 'apps'>('dashboard');
  const [runMode, setRunMode] = useState<'manual' | 'foto'>('manual');
  const [runKm, setRunKm] = useState(3.0);
  const [runDuration, setRunDuration] = useState('00:30');
  const [runDate, setRunDate] = useState(new Date().toISOString().split('T')[0]);
  const [runSuccess, setRunSuccess] = useState(false);
  const [runScope, setRunScope] = useState<'empresa' | 'pais' | 'global'>('empresa');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showMoodToast, setShowMoodToast] = useState(false);
  const [runImageFile, setRunImageFile] = useState<File | null>(null);
  const [runImagePreview, setRunImagePreview] = useState<string | null>(null);
  const [runUploading, setRunUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [
        postsData,
        commentsData,
        todosData,
        communitiesData,
        coursesData,
        benefitsData,
        activitiesData,
        moodData,
      ] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: false }),
        supabase.from('todos').select('*'),
        supabase.from('communities').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('benefits').select('*'),
        supabase.from('run_activities').select('*').order('activity_date', { ascending: false }),
        supabase.from('mood_entries').select('*').order('created_at', { ascending: false }),
      ]);

      if (postsData.data) setPosts(postsData.data);
      if (commentsData.data) {
        const commentsByPost: Record<string, Comment[]> = {};
        commentsData.data.forEach((comment: Comment) => {
          if (!commentsByPost[comment.post_id]) {
            commentsByPost[comment.post_id] = [];
          }
          commentsByPost[comment.post_id].push(comment);
        });
        setComments(commentsByPost);
      }
      if (todosData.data) setTodos(todosData.data);
      if (communitiesData.data) setCommunities(communitiesData.data);
      if (coursesData.data) setCourses(coursesData.data);
      if (benefitsData.data) setBenefits(benefitsData.data);
      if (activitiesData.data) setRunActivities(activitiesData.data);
      if (moodData.data) setMoodEntries(moodData.data);
    };

    fetchData();
  }, []);

  const handleMoodSelect = async (index: number) => {
    setSelectedMood(index);
    setShowMoodToast(true);

    await supabase.from('mood_entries').insert([
      {
        mood_index: index,
        created_at: new Date().toISOString(),
      },
    ]);

    setTimeout(() => setShowMoodToast(false), 3000);
  };

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) return;

    const { data } = await supabase
      .from('todos')
      .insert([{ text: newTodoText, completed: false }])
      .select();

    if (data) {
      setTodos([...todos, data[0]]);
      setNewTodoText('');
    }
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    await supabase.from('todos').update({ completed: !completed }).eq('id', id);
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
  };

  const handleToggleCommunity = async (id: string, joined: boolean) => {
    await supabase.from('communities').update({ joined: !joined }).eq('id', id);
    setCommunities(communities.map((c) => (c.id === id ? { ...c, joined: !joined } : c)));
  };

  const handleRunImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRunImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setRunImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveRunImage = () => {
    setRunImageFile(null);
    setRunImagePreview(null);
  };

  const uploadRunImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error } = await supabase.storage
      .from('run-images')
      .upload(fileName, file);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data: urlData } = supabase.storage
      .from('run-images')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleRegisterRun = async () => {
    setRunUploading(true);
    let imageUrl: string | null = null;

    if (runImageFile) {
      imageUrl = await uploadRunImage(runImageFile);
    }

    const { data } = await supabase
      .from('run_activities')
      .insert([
        {
          km: runKm,
          duration: runDuration,
          activity_date: runDate,
          created_at: new Date().toISOString(),
          image_url: imageUrl,
        },
      ])
      .select();

    if (data) {
      setRunActivities([data[0], ...runActivities]);
      setRunSuccess(true);
      setRunImageFile(null);
      setRunImagePreview(null);
      setTimeout(() => setRunSuccess(false), 3000);
    }
    setRunUploading(false);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalKm = runActivities.reduce((sum, activity) => sum + activity.km, 0);
  const ranking: Array<{ position: number; name: string; km: number; avatar: string }> = [
    { position: 1, name: 'María García', km: 125.4, avatar: '👩‍🦰' },
    { position: 2, name: 'Carlos López', km: 98.2, avatar: '👨‍💼' },
    { position: 3, name: 'Tú', km: 78.5, avatar: '😊' },
  ];

  const renderMuro = () => (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', paddingTop: '12px', paddingBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '16px', paddingRight: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: '600', color: 'var(--humand-950)', letterSpacing: '-0.5px' }}>humand</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Clock size={22} color="var(--humand-950)" strokeWidth={1.5} />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--humand-950)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" rx="2"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>
            <Search size={22} color="var(--humand-950)" strokeWidth={1.5} />
            <Bell size={22} color="var(--humand-950)" strokeWidth={1.5} />
          </div>
        </div>

        {/* Tab pills — matching screenshot: outlined rounded pills */}
        <div style={{ display: 'flex', gap: '8px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-100)' }}>
          {[
            { label: 'Muro', active: true },
            { label: 'Grupos', active: false },
            { label: 'Noticias', active: false },
            { label: 'Marketplace', active: false, badge: '7' },
          ].map((pill) => (
            <div
              key={pill.label}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: pill.active ? '600' : '400',
                color: pill.active ? 'var(--humand-950)' : 'var(--text-lighter)',
                border: `1.5px solid ${pill.active ? 'var(--humand-950)' : 'var(--neutral-200)'}`,
                backgroundColor: 'white',
                whiteSpace: 'nowrap',
                position: 'relative',
                letterSpacing: '0.2px',
                lineHeight: '1.4',
              }}
            >
              {pill.label}
              {pill.badge && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  backgroundColor: '#e74444', color: 'white', borderRadius: '999px',
                  minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '600', border: '2px solid white',
                }}>
                  {pill.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div style={{ paddingBottom: '80px' }}>
        {posts.slice(0, 5).map((post) => (
          <div key={post.id} style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid var(--neutral-100)' }}>
            {/* Author row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
              {post.author_avatar ? (
                <img src={post.author_avatar} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--humand-100)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--text-default)', fontSize: '14px', lineHeight: '1.4', letterSpacing: '0.2px' }}>{post.author_name}</div>
                <div style={{ color: 'var(--text-lighter)', fontSize: '12px', lineHeight: '1.4', letterSpacing: '0.2px' }}>{formatRelativeTime(post.created_at)}</div>
              </div>
              <div style={{ color: 'var(--text-lighter)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>•••</div>
            </div>

            {/* Content */}
            <div style={{ color: 'var(--text-default)', fontSize: '14px', lineHeight: '1.4', letterSpacing: '0.2px', marginBottom: '8px' }}>{post.content}</div>

            {/* "Ver traducción" link */}
            <div style={{ color: 'var(--text-lighter)', fontSize: '12px', marginBottom: '12px', letterSpacing: '0.2px' }}>Ver traducción</div>

            {/* Reactions row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', marginBottom: '12px' }}>
              {post.reactions?.heart > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>❤️</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-default)', letterSpacing: '0.2px' }}>{post.reactions.heart}</span>
                </div>
              )}
              {post.reactions?.thumbsup > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>👍</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-default)', letterSpacing: '0.2px' }}>{post.reactions.thumbsup}</span>
                </div>
              )}
              {post.reactions?.star > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>🤩</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-default)', letterSpacing: '0.2px' }}>{post.reactions.star}</span>
                </div>
              )}
              <div style={{ marginLeft: 'auto', color: 'var(--text-lighter)', fontSize: '12px' }}>Ver todo</div>
            </div>

            {/* Comment/actions bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--neutral-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-default)', fontSize: '12px', fontWeight: '400', letterSpacing: '0.2px' }}>
                <MessageCircle size={16} color="var(--text-default)" />
                Comentar
              </div>
              <div style={{ color: 'var(--text-lighter)', fontSize: '12px', letterSpacing: '0.2px' }}>
                {(comments[post.id]?.length || 0)} Comentarios
              </div>
            </div>

            {/* Inline comments */}
            {(comments[post.id]?.length || 0) > 0 && (
              <div style={{ marginTop: '12px' }}>
                {comments[post.id]?.slice(0, 2).map((comment) => (
                  <div key={comment.id} style={{ display: 'flex', gap: '10px', marginBottom: '12px', paddingLeft: '4px' }}>
                    {comment.author_avatar ? (
                      <img src={comment.author_avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--neutral-100)', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, backgroundColor: 'var(--neutral-50)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontWeight: '600', fontSize: '12px', color: 'var(--text-default)', marginBottom: '2px', letterSpacing: '0.2px' }}>{comment.author_name}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-default)', lineHeight: '1.4', letterSpacing: '0.2px' }}>{comment.content}</div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>👍 {comment.likes || 0}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>💬</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--humand-500)', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.2px' }}>
                  Responder
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const AppIcon = ({ children, color = '#6f93eb', bg = '#eff2ff' }: { children: React.ReactNode; color?: string; bg?: string }) => (
    <div style={{
      width: '64px', height: '64px', borderRadius: '16px',
      backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'var(--shadow-4dp)',
    }}>
      {children}
    </div>
  );

  const renderApps = () => {
    const appItems: Array<{
      name: string;
      icon: React.ReactNode;
      badge?: string;
      badgeColor?: string;
      badgeBg?: string;
      action?: () => void;
    }> = [
      {
        name: 'Personas',
        icon: <AppIcon><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6f93eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></AppIcon>,
      },
      {
        name: 'Control horario',
        icon: <AppIcon color="#28c040" bg="#e6fbe9"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#28c040" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></AppIcon>,
      },
      {
        name: 'Marcajes',
        icon: <AppIcon color="#496be3" bg="#dee5fb"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#496be3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></AppIcon>,
      },
      {
        name: 'Organigrama',
        icon: <AppIcon color="#6f93eb" bg="#eff2ff"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6f93eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M12 8v4"/><path d="M6 16h4"/><path d="M14 16h4"/><path d="M6 12h12"/><path d="M8 12v4"/><path d="M16 12v4"/></svg></AppIcon>,
      },
      {
        name: 'Onboarding',
        icon: <AppIcon color="#28c040" bg="#e6fbe9"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#28c040" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8"/><path d="M8 14h4"/></svg></AppIcon>,
      },
      {
        name: 'Onboarding',
        icon: <AppIcon color="#886bff" bg="#e9e8ff"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#886bff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg></AppIcon>,
        badge: 'Nuevo', badgeColor: '#28c040', badgeBg: '#e6fbe9',
      },
      {
        name: 'Encuestas',
        icon: <AppIcon color="#886bff" bg="#f4f2ff"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#886bff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></AppIcon>,
      },
      {
        name: 'Marketplace',
        icon: <AppIcon color="#e74444" bg="#fde3e3"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e74444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></AppIcon>,
        badge: '7',
      },
      {
        name: 'Vacaciones y\npermisos',
        icon: <AppIcon color="#6f93eb" bg="#eff2ff"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6f93eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></AppIcon>,
      },
      {
        name: 'Aprendizaje',
        icon: <AppIcon color="#35a48e" bg="#d5f2e9"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#35a48e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg></AppIcon>,
      },
      {
        name: 'Eventos',
        icon: <AppIcon color="#e9582b" bg="#fce7d8"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e9582b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></svg></AppIcon>,
      },
      {
        name: 'Librerías',
        icon: <AppIcon color="#496be3" bg="#dee5fb"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#496be3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></AppIcon>,
      },
      {
        name: 'Tareas',
        icon: <AppIcon color="#6f93eb" bg="#eff2ff"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6f93eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></AppIcon>,
      },
      {
        name: 'Landing',
        icon: <AppIcon color="#303036" bg="#eeeef1"><div style={{ fontSize: '18px', fontWeight: '600', color: '#303036', fontFamily: 'Roboto, sans-serif' }}>hu</div></AppIcon>,
      },
      {
        name: 'Notion',
        icon: <AppIcon color="#303036" bg="#eeeef1"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#303036" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 4v16"/><path d="M12 8h4"/><path d="M12 12h4"/><path d="M12 16h2"/></svg></AppIcon>,
      },
      {
        name: 'Humand\nCommunity',
        icon: <AppIcon color="white" bg="#496be3"><Globe size={28} color="white" /></AppIcon>,
        action: () => { setScreen('community'); setActiveTab('community'); },
      },
    ];

    return (
      <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '24px 16px 16px' }}>
          <div style={{ fontSize: '32px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '24px', lineHeight: '1.3', letterSpacing: '0.2px' }}>Apps</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px 16px' }}>
            {appItems.map((app, idx) => (
              <div
                key={idx}
                onClick={app.action}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  cursor: app.action ? 'pointer' : 'default', position: 'relative',
                }}
              >
                {app.icon}
                {app.badge === '7' && (
                  <div style={{
                    position: 'absolute', top: '-2px', right: '12px',
                    backgroundColor: '#e74444', color: 'white', borderRadius: '999px',
                    minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '600', padding: '0 5px',
                    border: '2px solid var(--bg-layout)',
                  }}>
                    7
                  </div>
                )}
                {app.badge === 'Nuevo' && (
                  <div style={{
                    position: 'absolute', top: '-4px', right: '2px',
                    backgroundColor: '#e6fbe9', color: '#28c040', borderRadius: '4px',
                    fontSize: '9px', fontWeight: '600', padding: '2px 5px',
                    letterSpacing: '0.2px',
                  }}>
                    Nuevo
                  </div>
                )}
                <div style={{
                  fontSize: '12px', color: 'var(--text-default)', textAlign: 'center',
                  lineHeight: '1.4', letterSpacing: '0.2px', whiteSpace: 'pre-line',
                  maxWidth: '80px',
                }}>
                  {app.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCommunityHub = () => (
    <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px', marginBottom: '16px' }}>
          <ArrowLeft size={24} onClick={() => { setScreen('apps'); setActiveTab('apps'); }} style={{ cursor: 'pointer' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}>
            <Globe size={20} />
            Humand Community
          </div>
        </div>

        <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
          <input
            type="text"
            placeholder="Buscar en Community..."
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
            }}
          />
        </div>
      </div>

      {/* Featured Run Challenge Banner */}
      <div
        onClick={() => { setActiveApp('run'); setScreen('app'); }}
        style={{
          margin: '16px', padding: '20px', borderRadius: '12px', cursor: 'pointer', color: 'white',
          background: 'linear-gradient(135deg, #3851d8 0%, #496be3 50%, #6f93eb 100%)',
          boxShadow: 'var(--shadow-8dp)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', letterSpacing: '0.2px' }}>Humand Run Challenge</div>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9, letterSpacing: '0.2px', lineHeight: '1.4' }}>Únete a la comunidad y corre juntos. Meta: 100km</div>
      </div>

      {/* Mini-apps grid with SVG icons */}
      <div style={{ padding: '8px 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { name: 'Bienestar', id: 'bienestar', color: '#35a48e', bg: '#d5f2e9',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35a48e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
            { name: 'Cursos', id: 'courses', color: '#496be3', bg: '#dee5fb',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#496be3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
            { name: 'Club', id: 'club', color: '#e9582b', bg: '#fce7d8',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e9582b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
            { name: 'To Do List', id: 'todo', color: '#28c040', bg: '#e6fbe9',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28c040" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
            { name: 'Juegos', id: 'juegos', color: '#886bff', bg: '#e9e8ff',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#886bff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="11" x2="15.01" y2="11"/><line x1="18" y1="13" x2="18.01" y2="13"/></svg> },
            { name: 'Salud', id: 'health', color: '#28c040', bg: '#e6fbe9',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28c040" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
            { name: 'Comunidades', id: 'comunidades', color: '#6f93eb', bg: '#eff2ff',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6f93eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { name: 'Finanzas', id: 'finanzas', color: '#f0b623', bg: '#fdfaec',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0b623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
            { name: 'Humand Run', id: 'run', color: '#496be3', bg: '#dee5fb',
              svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#496be3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M7 20l3-8"/><path d="M10.5 12L14 8l4 1"/><path d="M5.5 16l2.5-4 4 2"/></svg> },
          ].map((app) => (
            <div
              key={app.id}
              onClick={() => { setActiveApp(app.id as typeof activeApp); setScreen('app'); }}
              style={{
                backgroundColor: 'white', borderRadius: '12px', padding: '16px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                cursor: 'pointer', boxShadow: 'var(--shadow-4dp)',
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', backgroundColor: app.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {app.svg}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-default)', textAlign: 'center', lineHeight: '1.4', letterSpacing: '0.2px' }}>{app.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppScreen = () => {
    if (activeApp === 'bienestar') {
      return (
        <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
          <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
              <ArrowLeft size={24} onClick={() => setScreen('community')} style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>Bienestar</div>
            </div>
          </div>

          <div style={{ padding: '24px 16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: 'var(--shadow-4dp)', marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '16px' }}>¿Cómo te sientes hoy?</div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                {[
                  { emoji: '😄', label: 'Genial' },
                  { emoji: '🙂', label: 'Bien' },
                  { emoji: '😐', label: 'Regular' },
                  { emoji: '😔', label: 'Bajo' },
                  { emoji: '😢', label: 'Mal' },
                ].map((mood, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleMoodSelect(idx)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      opacity: selectedMood === idx ? 1 : 0.6,
                      transform: selectedMood === idx ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '32px' }}>{mood.emoji}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-lighter)' }}>{mood.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {showMoodToast && (
              <div style={{ backgroundColor: 'var(--green-600)', color: 'white', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
                ¡Registrado! Tu bienestar importa 💪
              </div>
            )}

            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Recursos recomendados</div>
            {[
              { title: 'Meditación', duration: '10 min', icon: 'lotus', bgColor: '#d5f2e9', iconColor: '#35a48e' },
              { title: 'Respiración', duration: '5 min', icon: 'wind', bgColor: '#eff2ff', iconColor: '#6f93eb' },
              { title: 'Journaling', duration: '15 min', icon: 'book', bgColor: '#e9e8ff', iconColor: '#886bff' },
            ].map((resource, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-4dp)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: resource.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {resource.icon === 'lotus' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/><path d="M12 9V3M15 15l4.24-4.24M19 19h6M9 15l-4.24-4.24M5 19H-1M9 9l-4.24 4.24M3 5H-3M15 9l4.24 4.24M21 5h6"/></svg>
                    )}
                    {resource.icon === 'wind' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.59 4.59A2 2 0 1 1 16 8H2m0 2h16a2 2 0 1 0 1.41-3.41M3 12h14m-8 4h8a2 2 0 0 0 2-2"/></svg>
                    )}
                    {resource.icon === 'book' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-default)' }}>{resource.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{resource.duration}</div>
                  </div>
                </div>
                <Play size={20} style={{ color: 'var(--humand-500)' }} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeApp === 'courses') {
      return (
        <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
          <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
              <ArrowLeft size={24} onClick={() => setScreen('community')} style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Cursos</div>
            </div>
          </div>

          {!selectedCourse ? (
            <>
              <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'white', borderBottom: '1px solid var(--neutral-100)', overflowX: 'auto' }}>
                {[
                  { label: 'Todos', value: 'todos' },
                  { label: 'Tech', value: 'tech' },
                  { label: 'Soft Skills', value: 'soft' },
                  { label: 'En Curso', value: 'en-curso' },
                ].map((tab) => (
                  <div
                    key={tab.value}
                    onClick={() => setCourseTab(tab.value as typeof courseTab)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: courseTab === tab.value ? 'var(--humand-500)' : 'white',
                      color: courseTab === tab.value ? 'white' : 'var(--text-lighter)',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: '500',
                      border: courseTab === tab.value ? 'none' : '1px solid var(--neutral-100)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>

              <div style={{ padding: '16px' }}>
                {courses.slice(0, 4).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-4dp)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: course.category === 'tech' ? '#dee5fb' : '#d5f2e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={course.category === 'tech' ? '#496be3' : '#35a48e'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)' }}>{course.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{course.subtitle}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {course.tags.slice(0, 2).map((tag, idx) => (
                        <div key={idx} style={{ backgroundColor: 'var(--humand-50)', color: 'var(--humand-500)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>
                          {tag}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '8px' }}>
                      <span>{course.duration}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f0b623" stroke="#f0b623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 10.26 23.77 10.36 17.13 16.17 19.09 24.95 12 19.27 4.91 24.95 6.87 16.17 0.23 10.36 8.91 10.26 12 2"/>
                        </svg>
                        {course.rating}
                      </span>
                    </div>
                    <div style={{ backgroundColor: 'var(--neutral-100)', borderRadius: '4px', height: '4px', marginBottom: '8px', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: 'var(--humand-500)', width: `${course.progress}%`, height: '100%' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-lighter)' }}>{course.progress}% completado</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div onClick={() => setSelectedCourse(null)} style={{ padding: '16px', color: 'var(--humand-500)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                ← Volver
              </div>
              {courses.find((c) => c.id === selectedCourse) && (
                <div style={{ padding: '16px' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--humand-500)',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '32px 16px',
                      textAlign: 'center',
                      marginBottom: '24px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{courses.find((c) => c.id === selectedCourse)?.title}</div>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Módulos</div>
                  {courses
                    .find((c) => c.id === selectedCourse)
                    ?.modules.map((module, idx) => (
                      <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-4dp)' }}>
                        <div>
                          {module.status === 'completed' && <CheckCircle2 size={20} style={{ color: 'var(--green-600)' }} />}
                          {module.status === 'in_progress' && <Circle size={20} style={{ color: 'var(--humand-500)' }} />}
                          {module.status === 'locked' && <Lock size={20} style={{ color: 'var(--text-lighter)' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '14px',
                              color: module.status === 'completed' ? 'var(--text-lighter)' : 'var(--text-default)',
                              textDecoration: module.status === 'completed' ? 'line-through' : 'none',
                            }}
                          >
                            {module.title}
                          </div>
                        </div>
                      </div>
                    ))}

                  <div style={{ marginTop: '24px', backgroundColor: 'var(--humand-500)', color: 'white', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', fontWeight: '600', cursor: 'pointer' }}>
                    Continuar aprendiendo
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (activeApp === 'club') {
      return (
        <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
          <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
              <ArrowLeft size={24} onClick={() => setScreen('community')} style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>Club de Beneficios</div>
            </div>
          </div>

          {!selectedBenefit ? (
            <>
              <div style={{ display: 'flex', gap: '8px', padding: '16px', backgroundColor: 'white', borderBottom: '1px solid var(--neutral-100)', overflowX: 'auto' }}>
                {[
                  { label: 'Todos', value: 'todos' },
                  { label: 'Gastronomía', value: 'gastronomia' },
                  { label: 'Cine', value: 'cine' },
                  { label: 'Shopping', value: 'shopping' },
                ].map((filter) => (
                  <div
                    key={filter.value}
                    onClick={() => setClubFilter(filter.value as typeof clubFilter)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: clubFilter === filter.value ? 'var(--humand-500)' : 'white',
                      color: clubFilter === filter.value ? 'white' : 'var(--text-lighter)',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: '500',
                      border: clubFilter === filter.value ? 'none' : '1px solid var(--neutral-100)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {filter.label}
                  </div>
                ))}
              </div>

              <div style={{ padding: '16px' }}>
                {benefits.slice(0, 6).map((benefit) => (
                  <div
                    key={benefit.id}
                    onClick={() => setSelectedBenefit(benefit.id)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-4dp)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: benefit.category === 'gastronomia' ? '#fce7d8' : benefit.category === 'cine' ? '#e9e8ff' : '#dee5fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {benefit.category === 'gastronomia' && (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e9582b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6.5 12c0 2.76 1.76 5.12 4.24 6.12.7.3 1.26 1.06 1.26 1.88 0 1.1-.9 2-2 2-.55 0-1.05-.23-1.4-.6m10.68-10.4c1.1 0 2 .9 2 2 0 .82-.56 1.58-1.26 1.88C16.88 16.88 15.12 19.24 12.36 19.24c-1.1 0-2-.9-2-2M9.5 9h5M3 12h18M5 12c0-.55.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1H6c-.55 0-1-.45-1-1z"/>
                          </svg>
                        )}
                        {benefit.category === 'cine' && (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#886bff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                        )}
                        {benefit.category === 'shopping' && (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#496be3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)' }}>{benefit.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{benefit.brand}</div>
                        <div style={{ backgroundColor: 'var(--red-500)', color: 'white', display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', marginTop: '8px' }}>
                          {benefit.discount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div onClick={() => setSelectedBenefit(null)} style={{ padding: '16px', color: 'var(--humand-500)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                ← Volver
              </div>
              {benefits.find((b) => b.id === selectedBenefit) && (
                <div style={{ padding: '16px' }}>
                  <div style={{ backgroundColor: 'var(--red-500)', color: 'white', borderRadius: '8px', padding: '32px 16px', textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{benefits.find((b) => b.id === selectedBenefit)?.discount} OFF</div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>{benefits.find((b) => b.id === selectedBenefit)?.name}</div>
                  </div>

                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: 'var(--shadow-4dp)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '8px' }}>Código de descuento</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--neutral-50)', padding: '12px', borderRadius: '4px' }}>
                      <div style={{ flex: 1, fontSize: '16px', fontWeight: '600', color: 'var(--text-default)' }}>{benefits.find((b) => b.id === selectedBenefit)?.code}</div>
                      <Copy
                        size={20}
                        onClick={() => copyToClipboard(benefits.find((b) => b.id === selectedBenefit)?.code || '')}
                        style={{ cursor: 'pointer', color: copiedCode === benefits.find((b) => b.id === selectedBenefit)?.code ? 'var(--green-600)' : 'var(--text-lighter)' }}
                      />
                    </div>
                    {copiedCode === benefits.find((b) => b.id === selectedBenefit)?.code && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--green-600)', fontWeight: '500' }}>✓ Copiado</div>
                    )}
                  </div>

                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: 'var(--shadow-4dp)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '8px' }}>Descripción</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-lighter)', lineHeight: '1.5' }}>{benefits.find((b) => b.id === selectedBenefit)?.description}</div>
                  </div>

                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: 'var(--shadow-4dp)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '8px' }}>Condiciones</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-lighter)', lineHeight: '1.5' }}>{benefits.find((b) => b.id === selectedBenefit)?.conditions}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (activeApp === 'todo') {
      return (
        <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
          <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
              <ArrowLeft size={24} onClick={() => setScreen('community')} style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>To Do List</div>
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'white', borderRadius: '8px', padding: '8px', boxShadow: 'var(--shadow-4dp)' }}>
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Agregar nueva tarea..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  padding: '8px',
                }}
              />
              <button
                onClick={handleAddTodo}
                style={{
                  backgroundColor: 'var(--humand-500)',
                  color: 'white',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                +
              </button>
            </div>

            {todos.map((todo) => (
              <div
                key={todo.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: 'var(--shadow-4dp)',
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id, todo.completed)}
                  style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                />
                <div
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    color: todo.completed ? 'var(--text-lighter)' : 'var(--text-default)',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                  }}
                >
                  {todo.text}
                </div>
                {todo.completed && <CheckCircle2 size={20} style={{ color: 'var(--green-600)' }} />}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeApp === 'juegos') {
      return (
        <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
          <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
              <ArrowLeft size={24} onClick={() => setScreen('community')} style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="11" x2="15.01" y2="11"/><line x1="18" y1="13" x2="18.01" y2="13"/></svg>Juegos</div>
            </div>
          </div>

          <div style={{ padding: '24px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { name: 'Trivia General', icon: 'brain', bgColor: '#e9e8ff', iconColor: '#886bff' },
                { name: 'Adivina el Emoji', icon: 'puzzle', bgColor: '#fce7d8', iconColor: '#e9582b' },
                { name: 'Humand Wordle', icon: 'grid', bgColor: '#dee5fb', iconColor: '#496be3' },
                { name: 'Versus 1v1', icon: 'zap', bgColor: '#fde3e3', iconColor: '#e74444' },
              ].map((game, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-4dp)',
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: game.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {game.icon === 'brain' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={game.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.59 4.59A2 2 0 1 1 16 8H2m0 2h16a2 2 0 1 0 1.41-3.41M3 12h14m-8 4h8a2 2 0 0 0 2-2"/></svg>
                    )}
                    {game.icon === 'puzzle' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={game.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7.21 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.29"/><path d="M9 3v6m6-6v6m-3 3h5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5m0-12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2m0-8V3m0 0h-2.5A2.5 2.5 0 0 0 3 5.5V9"/>
                      </svg>
                    )}
                    {game.icon === 'grid' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={game.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
                      </svg>
                    )}
                    {game.icon === 'zap' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={game.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center', color: 'var(--text-default)' }}>{game.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeApp === 'health') {
      return (
        <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
          <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
              <ArrowLeft size={24} onClick={() => setScreen('community')} style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>Salud</div>
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Recetas saludables</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { name: 'Bowl de Quinoa', icon: 'salad', bgColor: '#e6fbe9', iconColor: '#28c040' },
                { name: 'Smoothie Verde', icon: 'cup', bgColor: '#d5f2e9', iconColor: '#35a48e' },
                { name: 'Wrap de Pollo', icon: 'utensils', bgColor: '#fce7d8', iconColor: '#e9582b' },
                { name: 'Avena Overnight', icon: 'bowl', bgColor: '#fdfaec', iconColor: '#f0b623' },
              ].map((recipe, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-4dp)',
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: recipe.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {recipe.icon === 'salad' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={recipe.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 21H4a2 2 0 0 1-2-2V9m16-6h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3m0-18V5a2 2 0 0 0-2-2h-2.5a2 2 0 0 0-1 .27L9 5M3 9h18M3 13h18"/>
                      </svg>
                    )}
                    {recipe.icon === 'cup' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={recipe.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 4h12v7a6 6 0 0 1-6 6 6 6 0 0 1-6-6V4z"/><line x1="6" y1="4" x2="18" y2="4"/><path d="M9 21a3 3 0 0 0 3-3 3 3 0 0 0 3 3"/>
                      </svg>
                    )}
                    {recipe.icon === 'utensils' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={recipe.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V2"/><path d="M17 2v7c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V2"/><path d="M9 15c1.1 0 2 .9 2 2v5c0 .6-.4 1-1 1h-2c-.6 0-1-.4-1-1v-5c0-1.1.9-2 2-2z"/>
                      </svg>
                    )}
                    {recipe.icon === 'bowl' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={recipe.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="13" r="8"/><path d="M12 13v8m-8-8h16M4 5h16"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '500', textAlign: 'center', color: 'var(--text-default)' }}>{recipe.name}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Recursos de salud</div>
            {[
              { title: 'Ergonomía', description: 'Postura y bienestar en el trabajo', icon: 'monitor', bgColor: '#dee5fb', iconColor: '#496be3' },
              { title: 'Sueño saludable', description: 'Consejos para descansar mejor', icon: 'moon', bgColor: '#e9e8ff', iconColor: '#886bff' },
              { title: 'Hidratación', description: 'Bebe agua, vive saludable', icon: 'droplet', bgColor: '#dee5fb', iconColor: '#496be3' },
            ].map((resource, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', gap: '12px', boxShadow: 'var(--shadow-4dp)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: resource.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {resource.icon === 'monitor' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  )}
                  {resource.icon === 'moon' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                  {resource.icon === 'droplet' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-default)' }}>{resource.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{resource.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeApp === 'comunidades') {
      return (
        <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
          <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
              <ArrowLeft size={24} onClick={() => setScreen('community')} style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Comunidades</div>
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            {communities.map((community) => (
              <div key={community.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-4dp)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{community.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)' }}>{community.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{community.members} miembros</div>
                </div>
                <button
                  onClick={() => handleToggleCommunity(community.id, community.joined)}
                  style={{
                    backgroundColor: community.joined ? 'var(--green-600)' : 'var(--humand-500)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {community.joined ? 'Unido ✓' : 'Unirme'}
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeApp === 'finanzas') {
      return (
        <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
          <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
              <ArrowLeft size={24} onClick={() => setScreen('community')} style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Finanzas</div>
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '24px', boxShadow: 'var(--shadow-4dp)' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Presupuesto 50/30/20</div>

              <div style={{ backgroundColor: 'var(--neutral-100)', borderRadius: '4px', height: '24px', display: 'flex', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ width: '50%', backgroundColor: 'var(--humand-500)' }} />
                <div style={{ width: '30%', backgroundColor: 'var(--humand-400)' }} />
                <div style={{ width: '20%', backgroundColor: 'var(--green-600)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-default)' }}>Necesidades</div>
                  <div style={{ color: 'var(--text-lighter)' }}>$1,500</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-default)' }}>Gustos</div>
                  <div style={{ color: 'var(--text-lighter)' }}>$900</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-default)' }}>Ahorro</div>
                  <div style={{ color: 'var(--text-lighter)' }}>$600</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Recursos financieros</div>
            {[
              { title: 'Presupuesto 101', description: 'Aprende a gestionar tu dinero', icon: 'barchart', bgColor: '#fdfaec', iconColor: '#f0b623' },
              { title: 'Inversiones básicas', description: 'Primeros pasos en inversiones', icon: 'trendingup', bgColor: '#e6fbe9', iconColor: '#28c040' },
              { title: 'Deudas inteligentes', description: 'Maneja tus deudas de forma inteligente', icon: 'creditcard', bgColor: '#dee5fb', iconColor: '#496be3' },
            ].map((resource, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', gap: '12px', boxShadow: 'var(--shadow-4dp)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: resource.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {resource.icon === 'barchart' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  )}
                  {resource.icon === 'trendingup' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                    </svg>
                  )}
                  {resource.icon === 'creditcard' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={resource.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-default)' }}>{resource.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{resource.description}</div>
                </div>
                <ChevronRight size={20} style={{ color: 'var(--text-lighter)' }} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeApp === 'run') {
      return (
        <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
          <div style={{ backgroundColor: '#1d204e', paddingTop: '16px', paddingBottom: '16px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
              <ArrowLeft size={24} onClick={() => setScreen('community')} style={{ cursor: 'pointer' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M7 20l3-8"/><path d="M10.5 12L14 8l4 1"/><path d="M5.5 16l2.5-4 4 2"/></svg>Humand Run</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', padding: '16px', backgroundColor: 'white', borderBottom: '1px solid var(--neutral-100)', overflowX: 'auto' }}>
            {[
              { label: 'Dashboard', value: 'dashboard' },
              { label: 'Cargar', value: 'cargar' },
              { label: 'Ranking', value: 'ranking' },
              { label: 'Apps', value: 'apps' },
            ].map((tab) => (
              <div
                key={tab.value}
                onClick={() => setRunTab(tab.value as typeof runTab)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: runTab === tab.value ? 'var(--humand-500)' : 'white',
                  color: runTab === tab.value ? 'white' : 'var(--text-lighter)',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '500',
                  border: runTab === tab.value ? 'none' : '1px solid var(--neutral-100)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </div>
            ))}
          </div>

          <div style={{ padding: '16px' }}>
            {runTab === 'dashboard' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'KM Totales', value: `${totalKm.toFixed(1)}km`, icon: '🏃' },
                    { label: 'Actividades', value: `${runActivities.length}`, icon: '⌚' },
                    { label: 'Ranking', value: '#5', icon: '🏆' },
                    { label: 'Racha', value: `${(() => { if (runActivities.length === 0) return '0'; const sorted = [...runActivities].sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()); let streak = 1; for (let i = 1; i < sorted.length; i++) { const prev = new Date(sorted[i - 1].activity_date); const curr = new Date(sorted[i].activity_date); const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24); if (diff <= 1.5) streak++; else break; } return streak; })()} días`, icon: '🔥' },
                  ].map((stat, idx) => (
                    <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: 'var(--shadow-4dp)', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '4px' }}>{stat.label}</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-default)' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '24px', boxShadow: 'var(--shadow-4dp)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-default)' }}>Meta: 100km</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-default)' }}>{totalKm}/100km</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--neutral-100)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: 'var(--green-600)', width: `${(totalKm / 100) * 100}%`, height: '100%' }} />
                  </div>
                </div>

                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Actividades recientes</div>
                {runActivities.slice(0, 5).map((activity, idx) => (
                  <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', boxShadow: 'var(--shadow-4dp)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '20px' }}>🏃</div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-default)' }}>{activity.km}km</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{formatDate(activity.activity_date)}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{activity.duration}</div>
                    </div>
                    {activity.image_url && (
                      <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={activity.image_url} alt="Run" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {runTab === 'cargar' && (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <div
                    onClick={() => setRunMode('manual')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: runMode === 'manual' ? 'var(--humand-500)' : 'white',
                      color: runMode === 'manual' ? 'white' : 'var(--text-default)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-4dp)',
                    }}
                  >
                    Manual
                  </div>
                  <div
                    onClick={() => setRunMode('foto')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: runMode === 'foto' ? 'var(--humand-500)' : 'white',
                      color: runMode === 'foto' ? 'white' : 'var(--text-default)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-4dp)',
                    }}
                  >
                    Foto
                  </div>
                </div>

                {runMode === 'manual' ? (
                  <>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '24px', boxShadow: 'var(--shadow-4dp)', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '12px' }}>Kilómetros</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <button
                          onClick={() => setRunKm(Math.max(0, runKm - 0.1))}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--neutral-100)',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          −
                        </button>
                        <div style={{ fontSize: '32px', fontWeight: '600', color: 'var(--humand-500)', minWidth: '100px' }}>
                          {runKm.toFixed(1)}km
                        </div>
                        <button
                          onClick={() => setRunKm(runKm + 0.1)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--neutral-100)',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                      {[1.0, 3.0, 5.0, 10.0, 21.1, 42.2].map((km) => (
                        <button
                          key={km}
                          onClick={() => setRunKm(km)}
                          style={{
                            backgroundColor: runKm === km ? 'var(--humand-500)' : 'white',
                            color: runKm === km ? 'white' : 'var(--text-default)',
                            border: runKm === km ? 'none' : '1px solid var(--neutral-100)',
                            padding: '8px 12px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          {km}km
                        </button>
                      ))}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '8px' }}>Duración</div>
                      <input
                        type="text"
                        value={runDuration}
                        onChange={(e) => setRunDuration(e.target.value)}
                        placeholder="00:30"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--neutral-100)',
                          fontSize: '14px',
                          marginBottom: '12px',
                        }}
                      />

                      <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '8px' }}>Fecha</div>
                      <input
                        type="date"
                        value={runDate}
                        onChange={(e) => setRunDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--neutral-100)',
                          fontSize: '14px',
                        }}
                      />
                    </div>

                    {/* Image attachment section */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '8px' }}>Adjuntar foto (opcional)</div>
                      {!runImagePreview ? (
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '16px',
                          border: '2px dashed var(--neutral-200)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: 'var(--neutral-50)',
                          transition: 'border-color 0.2s',
                        }}>
                          <span style={{ fontSize: '20px' }}>📷</span>
                          <span style={{ fontSize: '14px', color: 'var(--text-lighter)' }}>Seleccionar imagen</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleRunImageSelect}
                            style={{ display: 'none' }}
                          />
                        </label>
                      ) : (
                        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                          <img src={runImagePreview} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                          <button
                            onClick={handleRemoveRunImage}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              width: '28px',
                              height: '28px',
                              borderRadius: '999px',
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              border: 'none',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {!runSuccess ? (
                      <button
                        onClick={handleRegisterRun}
                        disabled={runUploading}
                        style={{
                          width: '100%',
                          backgroundColor: runUploading ? 'var(--neutral-300)' : 'var(--humand-500)',
                          color: 'white',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: runUploading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {runUploading ? '⏳ Subiendo...' : `🏃 Registrar ${runKm.toFixed(1)}km`}
                      </button>
                    ) : (
                      <div style={{ backgroundColor: 'var(--green-600)', color: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
                        ✓ ¡Actividad registrada!
                      </div>
                    )}
                  </>
                ) : (
                  /* FOTO MODE — upload image and auto-detect (manual entry as fallback) */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: 'var(--shadow-4dp)' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '4px' }}>Subí la captura de tu app de running</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '16px' }}>Strava, Nike Run Club, Apple Health, etc.</div>

                      {!runImagePreview ? (
                        <label style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          padding: '32px 16px',
                          border: '2px dashed var(--humand-400)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          backgroundColor: 'var(--humand-50)',
                        }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '999px', backgroundColor: 'var(--humand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📷</div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--humand-500)' }}>Tomar foto o elegir de galería</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>JPG, PNG — máx. 10MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleRunImageSelect}
                            style={{ display: 'none' }}
                          />
                        </label>
                      ) : (
                        <div>
                          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                            <img src={runImagePreview} alt="Captura" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <button
                              onClick={handleRemoveRunImage}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '999px',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              ✕
                            </button>
                          </div>

                          <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '8px' }}>Completá los datos de tu actividad:</div>

                          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '4px' }}>KM</div>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={runKm}
                                onChange={(e) => setRunKm(parseFloat(e.target.value) || 0)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--neutral-200)', fontSize: '14px' }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '4px' }}>Duración</div>
                              <input
                                type="text"
                                placeholder="00:30"
                                value={runDuration}
                                onChange={(e) => setRunDuration(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--neutral-200)', fontSize: '14px' }}
                              />
                            </div>
                          </div>

                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '4px' }}>Fecha</div>
                            <input
                              type="date"
                              value={runDate}
                              onChange={(e) => setRunDate(e.target.value)}
                              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--neutral-200)', fontSize: '14px' }}
                            />
                          </div>

                          {!runSuccess ? (
                            <button
                              onClick={handleRegisterRun}
                              disabled={runUploading}
                              style={{
                                width: '100%',
                                backgroundColor: runUploading ? 'var(--neutral-300)' : 'var(--humand-500)',
                                color: 'white',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: runUploading ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {runUploading ? '⏳ Subiendo foto y registrando...' : `🏃 Registrar ${runKm.toFixed(1)}km con foto`}
                            </button>
                          ) : (
                            <div style={{ backgroundColor: 'var(--green-600)', color: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
                              ✓ ¡Actividad registrada con foto!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {runTab === 'ranking' && (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  {[
                    { label: 'Mi Empresa', value: 'empresa' },
                    { label: 'País', value: 'pais' },
                    { label: 'Global', value: 'global' },
                  ].map((scope) => (
                    <div
                      key={scope.value}
                      onClick={() => setRunScope(scope.value as typeof runScope)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: runScope === scope.value ? 'var(--humand-500)' : 'white',
                        color: runScope === scope.value ? 'white' : 'var(--text-lighter)',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '500',
                        border: runScope === scope.value ? 'none' : '1px solid var(--neutral-100)',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {scope.label}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px', alignItems: 'flex-end' }}>
                  {[2, 1, 3].map((pos) => {
                    const podiumData = [ranking[1], ranking[0], ranking[2]];
                    const data = podiumData[pos - 1];
                    const heights = ['120px', '160px', '100px'];
                    const bgColors = ['#c0c0c0', '#ffd700', '#cd7f32'];

                    return (
                      <div key={pos} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{data.avatar}</div>
                        <div
                          style={{
                            width: '100%',
                            height: heights[pos - 1],
                            backgroundColor: bgColors[pos - 1],
                            borderRadius: '8px 8px 0 0',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingBottom: '8px',
                            color: pos === 2 ? 'white' : 'black',
                            fontWeight: '600',
                          }}
                        >
                          {pos}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-default)', marginTop: '8px', textAlign: 'center' }}>
                          {data.km}km
                        </div>
                      </div>
                    );
                  })}
                </div>

                {ranking.map((person) => (
                  <div
                    key={person.position}
                    style={{
                      backgroundColor: person.position === 3 ? 'var(--humand-100)' : 'white',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: 'var(--shadow-4dp)',
                    }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-lighter)', minWidth: '24px' }}>#{person.position}</div>
                    <div style={{ fontSize: '20px' }}>{person.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-default)' }}>
                        {person.position === 3 ? 'Tú' : person.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{person.km}km recorridos</div>
                    </div>
                    {person.position === 1 && <Trophy size={20} style={{ color: '#ffd700' }} />}
                  </div>
                ))}
              </>
            )}

            {runTab === 'apps' && (
              <>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Integrar apps</div>

                {[
                  { name: 'Apple Health', connected: true, icon: '🍎' },
                  { name: 'Strava', connected: false, icon: '📱' },
                  { name: 'Garmin', connected: false, icon: '⌚' },
                  { name: 'Nike Run Club', connected: false, icon: '👟' },
                ].map((app, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: 'var(--shadow-4dp)',
                    }}
                  >
                    <div style={{ fontSize: '20px' }}>{app.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-default)' }}>{app.name}</div>
                      <div style={{ fontSize: '12px', color: app.connected ? 'var(--green-600)' : 'var(--text-lighter)' }}>
                        {app.connected ? '✓ Conectado' : 'Desconectado'}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '999px',
                        backgroundColor: app.connected ? 'var(--green-600)' : 'var(--neutral-200)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          position: 'absolute',
                          top: '2px',
                          left: app.connected ? '22px' : '2px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px', marginTop: '24px' }}>Dispositivos compatibles</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['iPhone', 'Apple Watch', 'Android', 'Smartwatch'].map((device, idx) => (
                    <div key={idx} style={{ backgroundColor: 'white', padding: '8px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '500', color: 'var(--humand-500)', border: '1px solid var(--humand-100)', boxShadow: 'var(--shadow-4dp)' }}>
                      {device}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        maxWidth: '390px',
        margin: '0 auto',
        backgroundColor: 'white',
        boxShadow: '0 0 40px rgba(0,0,0,0.1)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto' }}>
        {screen === 'muro' && renderMuro()}
        {screen === 'apps' && renderApps()}
        {screen === 'community' && renderCommunityHub()}
        {screen === 'app' && renderAppScreen()}
      </div>

      {/* Bottom Tab Bar — matches screenshot exactly */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          maxWidth: '390px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          backgroundColor: 'white',
          borderTop: '1px solid var(--neutral-150)',
          paddingTop: '10px',
          paddingBottom: '12px',
          boxShadow: 'var(--shadow-inverted)',
        }}
      >
        {[
          { label: 'Inicio', value: 'muro', icon: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { label: 'Chats', value: null, icon: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { label: 'Apps', value: 'apps', icon: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
          { label: 'Nuestra...', value: null, icon: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
          { label: 'Perfil', value: null, icon: (c: string) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map((tab, idx) => {
          const isActive = activeTab === tab.value;
          const color = isActive ? '#496be3' : '#8d8c9f';

          return (
            <div
              key={idx}
              onClick={() => {
                if (tab.value) {
                  setScreen(tab.value as 'muro' | 'apps' | 'community' | 'app');
                  setActiveTab(tab.value as 'muro' | 'apps' | 'community' | 'nuestra' | 'perfil');
                }
              }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: tab.value ? 'pointer' : 'default',
                opacity: tab.value ? 1 : 0.6,
              }}
            >
              {tab.icon(color)}
              <div style={{
                fontSize: '10px',
                color: color,
                letterSpacing: '0.2px',
                fontWeight: isActive ? '600' : '400',
              }}>
                {tab.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
