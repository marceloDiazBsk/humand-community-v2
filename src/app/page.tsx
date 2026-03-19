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

  const handleRegisterRun = async () => {
    const { data } = await supabase
      .from('run_activities')
      .insert([
        {
          km: runKm,
          duration: runDuration,
          activity_date: runDate,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (data) {
      setRunActivities([data[0], ...runActivities]);
      setRunSuccess(true);
      setTimeout(() => setRunSuccess(false), 2000);
    }
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
    <div style={{ backgroundColor: 'var(--bg-layout)' }} className="min-h-screen">
      <div style={{ backgroundColor: 'white', paddingTop: '16px', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '16px', paddingRight: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-default)' }}>humand</div>
          <div style={{ display: 'flex', gap: '12px', color: 'var(--text-lighter)' }}>
            <Clock size={20} />
            <Search size={20} />
            <Bell size={20} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingLeft: '16px', overflowX: 'auto', paddingRight: '16px' }}>
          <div style={{ padding: '8px 16px', backgroundColor: 'var(--humand-500)', color: 'white', borderRadius: '999px', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Muro
          </div>
          <div style={{ padding: '8px 16px', backgroundColor: 'white', color: 'var(--text-lighter)', borderRadius: '999px', fontSize: '14px', fontWeight: '500', border: '1px solid var(--neutral-100)', whiteSpace: 'nowrap' }}>
            Grupos
          </div>
          <div style={{ padding: '8px 16px', backgroundColor: 'white', color: 'var(--text-lighter)', borderRadius: '999px', fontSize: '14px', fontWeight: '500', border: '1px solid var(--neutral-100)', whiteSpace: 'nowrap' }}>
            Noticias
          </div>
          <div style={{ padding: '8px 16px', backgroundColor: 'white', color: 'var(--text-lighter)', borderRadius: '999px', fontSize: '14px', fontWeight: '500', border: '1px solid var(--neutral-100)', position: 'relative', whiteSpace: 'nowrap' }}>
            Marketplace
            <span style={{ position: 'absolute', top: '4px', right: '8px', backgroundColor: 'var(--red-500)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600' }}>
              7
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', backgroundColor: 'white', marginTop: '8px', marginLeft: '16px', marginRight: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: 'var(--shadow-4dp)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--humand-100)', flexShrink: 0 }} />
        <div style={{ color: 'var(--text-lighter)', fontSize: '14px', flex: 1 }}>¿Qué estás pensando?</div>
      </div>

      <div style={{ marginTop: '16px', paddingBottom: '80px' }}>
        {posts.slice(0, 5).map((post) => (
          <div key={post.id} style={{ backgroundColor: 'white', marginLeft: '16px', marginRight: '16px', marginBottom: '8px', padding: '16px', borderRadius: '8px', boxShadow: 'var(--shadow-4dp)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--humand-100)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--text-default)', fontSize: '14px' }}>{post.author_name}</div>
                <div style={{ color: 'var(--text-lighter)', fontSize: '12px' }}>{formatRelativeTime(post.created_at)}</div>
              </div>
            </div>

            <div style={{ color: 'var(--text-default)', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>{post.content}</div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--neutral-100)' }}>
              {post.reactions?.['❤️'] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>❤️</span>
                  <span>{post.reactions['❤️']}</span>
                </div>
              )}
              {post.reactions?.['👍'] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>👍</span>
                  <span>{post.reactions['👍']}</span>
                </div>
              )}
              {post.reactions?.['🤩'] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🤩</span>
                  <span>{post.reactions['🤩']}</span>
                </div>
              )}
              <div style={{ marginLeft: 'auto' }}>{(comments[post.id]?.length || 0)} comentarios</div>
            </div>

            {(comments[post.id]?.length || 0) > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--humand-500)', fontWeight: '600', cursor: 'pointer' }}>Ver todo ({comments[post.id]?.length || 0})</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderApps = () => (
    <div style={{ backgroundColor: 'var(--bg-layout)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ padding: '24px 16px' }}>
        <div style={{ fontSize: '32px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '24px' }}>Apps</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { name: 'Personas', emoji: '👥' },
            { name: 'Control horario', emoji: '⏱️' },
            { name: 'Marcajes', emoji: '✓' },
            { name: 'Organigrama', emoji: '📊' },
            { name: 'Onboarding', emoji: '🟢', label: 'verde' },
            { name: 'Onboarding', emoji: '🟣', badge: 'Nuevo', label: 'purple' },
            { name: 'Encuestas', emoji: '📋' },
            { name: 'Marketplace', emoji: '🛍️', badge: '7' },
            { name: 'Vacaciones', emoji: '🏖️' },
            { name: 'Aprendizaje', emoji: '📚' },
            { name: 'Eventos', emoji: '🎉' },
            { name: 'Librerías', emoji: '📖' },
            { name: 'Tareas', emoji: '☑️' },
            { name: 'Landing', emoji: '🚀' },
            { name: 'Notion', emoji: '📝' },
            { name: 'Humand Community', emoji: '🌍', badge: '🔴' },
          ].map((app, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (app.name === 'Humand Community') {
                  setScreen('community');
                  setActiveTab('community');
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: app.name === 'Humand Community' ? 'pointer' : 'default',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: app.name === 'Humand Community' ? 'var(--humand-500)' : 'white',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: 'var(--shadow-4dp)',
                }}
              >
                {app.emoji}
              </div>
              {app.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: app.badge === '🔴' || app.badge === '7' ? 'var(--red-500)' : 'var(--green-600)',
                    color: 'white',
                    borderRadius: '50%',
                    width: app.badge === '7' ? '20px' : '16px',
                    height: app.badge === '7' ? '20px' : '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: app.badge === '7' ? '10px' : '8px',
                    fontWeight: '600',
                  }}
                >
                  {app.badge === '🔴' ? '●' : app.badge}
                </div>
              )}
              <div style={{ fontSize: '12px', color: 'var(--text-default)', textAlign: 'center', fontWeight: '500' }}>{app.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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

      <div style={{ padding: '16px', backgroundColor: '#3b4eb8', marginLeft: '16px', marginRight: '16px', marginTop: '16px', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>🏃 Humand Run Challenge</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>Únete a la comunidad y corre juntos. Meta: 100km</div>
      </div>

      <div style={{ padding: '24px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { name: 'Bienestar', emoji: '🧘', id: 'bienestar' },
            { name: 'Cursos', emoji: '📚', id: 'courses' },
            { name: 'Club', emoji: '🎁', id: 'club' },
            { name: 'To Do List', emoji: '✅', id: 'todo' },
            { name: 'Juegos', emoji: '🎮', id: 'juegos' },
            { name: 'Salud', emoji: '🥗', id: 'health' },
            { name: 'Comunidades', emoji: '👥', id: 'comunidades' },
            { name: 'Finanzas', emoji: '💰', id: 'finanzas' },
            { name: 'Humand Run', emoji: '🏃', id: 'run' },
          ].map((app) => (
            <div
              key={app.id}
              onClick={() => {
                setActiveApp(app.id as typeof activeApp);
                setScreen('app');
              }}
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
              <div style={{ fontSize: '24px' }}>{app.emoji}</div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-default)', textAlign: 'center' }}>{app.name}</div>
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
              <div style={{ fontSize: '18px', fontWeight: '600' }}>🧘 Bienestar</div>
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
              { title: 'Meditación', duration: '10 min', icon: '🧘' },
              { title: 'Respiración', duration: '5 min', icon: '💨' },
              { title: 'Journaling', duration: '15 min', icon: '📔' },
            ].map((resource, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-4dp)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '20px' }}>{resource.icon}</div>
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
              <div style={{ fontSize: '18px', fontWeight: '600' }}>📚 Cursos</div>
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
                      <div style={{ fontSize: '32px' }}>{course.emoji}</div>
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
                      <span>⭐ {course.rating}</span>
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
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>{courses.find((c) => c.id === selectedCourse)?.emoji}</div>
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
              <div style={{ fontSize: '18px', fontWeight: '600' }}>🎁 Club de Beneficios</div>
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
                      <div style={{ fontSize: '32px' }}>{benefit.emoji}</div>
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
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>{benefits.find((b) => b.id === selectedBenefit)?.emoji}</div>
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
              <div style={{ fontSize: '18px', fontWeight: '600' }}>✅ To Do List</div>
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
              <div style={{ fontSize: '18px', fontWeight: '600' }}>🎮 Juegos</div>
            </div>
          </div>

          <div style={{ padding: '24px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { name: 'Trivia General', emoji: '🧠' },
                { name: 'Adivina el Emoji', emoji: '🤔' },
                { name: 'Humand Wordle', emoji: '📝' },
                { name: 'Versus 1v1', emoji: '⚔️' },
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
                  <div style={{ fontSize: '40px' }}>{game.emoji}</div>
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
              <div style={{ fontSize: '18px', fontWeight: '600' }}>🥗 Salud</div>
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Recetas saludables</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[
                { name: 'Bowl de Quinoa', emoji: '🥗' },
                { name: 'Smoothie Verde', emoji: '🥤' },
                { name: 'Wrap de Pollo', emoji: '🌯' },
                { name: 'Avena Overnight', emoji: '🥣' },
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
                  <div style={{ fontSize: '32px' }}>{recipe.emoji}</div>
                  <div style={{ fontSize: '12px', fontWeight: '500', textAlign: 'center', color: 'var(--text-default)' }}>{recipe.name}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-default)', marginBottom: '12px' }}>Recursos de salud</div>
            {[
              { title: 'Ergonomía', description: 'Postura y bienestar en el trabajo', icon: '🪑' },
              { title: 'Sueño saludable', description: 'Consejos para descansar mejor', icon: '😴' },
              { title: 'Hidratación', description: 'Bebe agua, vive saludable', icon: '💧' },
            ].map((resource, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', gap: '12px', boxShadow: 'var(--shadow-4dp)' }}>
                <div style={{ fontSize: '24px' }}>{resource.icon}</div>
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
              <div style={{ fontSize: '18px', fontWeight: '600' }}>👥 Comunidades</div>
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            {communities.map((community) => (
              <div key={community.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-4dp)' }}>
                <div style={{ fontSize: '32px' }}>{community.emoji}</div>
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
              <div style={{ fontSize: '18px', fontWeight: '600' }}>💰 Finanzas</div>
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
              { title: 'Presupuesto 101', description: 'Aprende a gestionar tu dinero', icon: '📊' },
              { title: 'Inversiones básicas', description: 'Primeros pasos en inversiones', icon: '📈' },
              { title: 'Deudas inteligentes', description: 'Maneja tus deudas de forma inteligente', icon: '💳' },
            ].map((resource, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', gap: '12px', boxShadow: 'var(--shadow-4dp)' }}>
                <div style={{ fontSize: '24px' }}>{resource.icon}</div>
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
              <div style={{ fontSize: '18px', fontWeight: '600' }}>🏃 Humand Run</div>
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
                    { label: 'KM Totales', value: '78.5km', icon: '🏃' },
                    { label: 'Actividades', value: '23', icon: '⌚' },
                    { label: 'Ranking', value: '#5', icon: '🏆' },
                    { label: 'Racha', value: '7 días', icon: '🔥' },
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
                  <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', boxShadow: 'var(--shadow-4dp)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>🏃</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-default)' }}>{activity.km}km</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{formatDate(activity.activity_date)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-lighter)' }}>{activity.duration}</div>
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

                    {!runSuccess ? (
                      <button
                        onClick={handleRegisterRun}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--humand-500)',
                          color: 'white',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        🏃 Registrar {runKm.toFixed(1)}km
                      </button>
                    ) : (
                      <div style={{ backgroundColor: 'var(--green-600)', color: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
                        ✓ ¡Actividad registrada!
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px 16px', textAlign: 'center', boxShadow: 'var(--shadow-4dp)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-lighter)' }}>Cargando desde foto</div>
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

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          maxWidth: '390px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: 'white',
          borderTop: '1px solid var(--neutral-100)',
          paddingTop: '8px',
          paddingBottom: '8px',
          height: '64px',
        }}
      >
        {[
          { icon: Home, label: 'Inicio', value: 'muro' },
          { icon: MessageSquare, label: 'Chats', value: null },
          { icon: LayoutGrid, label: 'Apps', value: 'apps' },
          { icon: Star, label: 'Nuestra...', value: null },
          { icon: User, label: 'Perfil', value: null },
        ].map((tab, idx) => {
          const isActive = activeTab === tab.value;
          const Icon = tab.icon;

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
                justifyContent: 'center',
                gap: '4px',
                cursor: tab.value ? 'pointer' : 'default',
                opacity: tab.value ? 1 : 0.5,
                position: 'relative',
              }}
            >
              <Icon size={24} color={isActive ? 'var(--humand-500)' : 'var(--text-lighter)'} />
              {isActive && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--humand-500)',
                  }}
                />
              )}
              <div
                style={{
                  fontSize: '10px',
                  color: isActive ? 'var(--humand-500)' : 'var(--text-lighter)',
                  textAlign: 'center',
                }}
              >
                {tab.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
