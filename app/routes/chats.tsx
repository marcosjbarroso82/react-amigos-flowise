import type { Route } from "./+types/chats";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chats - App Móvil" },
    { name: "description", content: "Página de chats con Flowise" },
  ];
}

interface ChatHistoryConfig {
  historyMode: 'client' | 'server';
  autoLoadHistory: boolean;
}

interface FlowiseEndpoint {
  id: string;
  name: string;
  url: string;
  description?: string;
  apiKey?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Chat {
  id: string;
  title: string;
  endpointId: string;
  endpointName: string;
  chatId: string;
  messages: ChatMessage[];
  createdAt: number;
  lastMessageAt: number;
  historyMode: 'client' | 'server';
}

export default function Chats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [endpoints, setEndpoints] = useState<FlowiseEndpoint[]>([]);
  const [historyConfig, setHistoryConfig] = useState<ChatHistoryConfig>({
    historyMode: 'client',
    autoLoadHistory: true
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [newChat, setNewChat] = useState({
    title: '',
    endpointId: '',
    chatId: '',
    historyMode: 'client' as 'client' | 'server'
  });

  // Cargar datos del localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('flowise-chats');
    const savedEndpoints = localStorage.getItem('flowise-endpoints');
    const savedHistoryConfig = localStorage.getItem('flowise-history-config');
    
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
    if (savedEndpoints) {
      setEndpoints(JSON.parse(savedEndpoints));
    }
    if (savedHistoryConfig) {
      setHistoryConfig(JSON.parse(savedHistoryConfig));
    }
    
    setIsInitialized(true);
  }, []);

  // Guardar chats en localStorage cuando cambien
  useEffect(() => {
    // Solo guardar después de que se haya inicializado el componente
    if (isInitialized) {
      localStorage.setItem('flowise-chats', JSON.stringify(chats));
    }
  }, [chats, isInitialized]);

  const handleCreateChat = async () => {
    if (!newChat.title.trim() || !newChat.endpointId) {
      alert('Por favor completa el título y selecciona un endpoint');
      return;
    }

    const endpoint = endpoints.find(ep => ep.id === newChat.endpointId);
    if (!endpoint) return;

    const chatId = newChat.chatId.trim() || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let initialMessages: ChatMessage[] = [];

    // Si se proporcionó un chatId y está habilitada la carga automática, cargar historial
    if (newChat.chatId.trim() && historyConfig.autoLoadHistory) {
      initialMessages = await loadChatHistory(chatId, endpoint.url, endpoint.apiKey);
    }

    const chat: Chat = {
      id: Date.now().toString(),
      title: newChat.title.trim(),
      endpointId: newChat.endpointId,
      endpointName: endpoint.name,
      chatId: chatId,
      messages: initialMessages,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
      historyMode: newChat.historyMode
    };

    setChats([chat, ...chats]);
    setNewChat({ title: '', endpointId: '', chatId: '', historyMode: 'client' });
    setShowCreateForm(false);
    setSelectedChat(chat);
  };

  const handleDeleteChat = (chatId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este chat?')) {
      setChats(chats.filter(chat => chat.id !== chatId));
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
    }
  };

  const loadChatHistory = async (chatId: string, endpointUrl: string, apiKey?: string) => {
    setIsLoadingHistory(true);
    try {
      // Usar el endpoint que funciona: /api/v1/chatmessage?chatId=
      const historyUrl = `${endpointUrl.replace('/api/v1/prediction/', '/api/v1/chatmessage/')}?chatId=${chatId}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Agregar API Key si está disponible
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['X-API-Key'] = apiKey;
      }

      const response = await fetch(historyUrl, {
        method: 'GET',
        headers,
      });
      
      let historyData = null;
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          historyData = await response.json();
          console.log(`Successfully loaded history from: ${historyUrl}`);
        } else {
          console.warn(`Endpoint ${historyUrl} returned non-JSON content (${contentType}).`);
        }
      } else if (response.status === 401) {
        console.warn(`Authentication required for ${historyUrl}. API Key may be needed.`);
      } else if (response.status === 404) {
        console.warn(`Endpoint ${historyUrl} not found.`);
      } else {
        console.warn(`Failed to load history from ${historyUrl}. Status: ${response.status}`);
      }

      if (historyData) {
        // Convertir el historial del servidor al formato local
        const messages: ChatMessage[] = [];
        
        if (Array.isArray(historyData)) {
          // Si es un array directo de mensajes
          historyData.forEach((msg: any) => {
            messages.push({
              id: msg.id || Date.now().toString(),
              role: msg.role === 'userMessage' ? 'user' : 'assistant',
              content: msg.content || msg.message || '',
              timestamp: msg.timestamp || Date.now()
            });
          });
        } else if (historyData.data && Array.isArray(historyData.data)) {
          // Si está dentro de un objeto con propiedad data
          historyData.data.forEach((msg: any) => {
            messages.push({
              id: msg.id || Date.now().toString(),
              role: msg.role === 'userMessage' ? 'user' : 'assistant',
              content: msg.content || msg.message || '',
              timestamp: msg.timestamp || Date.now()
            });
          });
        }

        return messages;
      } else {
        console.warn('No se pudo cargar el historial desde el servidor.');
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
    return [];
  };

  const handleRefreshHistory = async () => {
    if (!selectedChat) return;
    
    const endpoint = endpoints.find(ep => ep.id === selectedChat.endpointId);
    if (!endpoint) return;

    setIsLoadingHistory(true);
    try {
      const refreshedMessages = await loadChatHistory(selectedChat.chatId, endpoint.url, endpoint.apiKey);
      
      if (refreshedMessages.length > 0) {
        const updatedChat = {
          ...selectedChat,
          messages: refreshedMessages,
          lastMessageAt: Date.now()
        };
        
        setChats(chats.map(chat => chat.id === selectedChat.id ? updatedChat : chat));
        setSelectedChat(updatedChat);
      } else {
        alert('No se pudo cargar el historial. Verifica que el endpoint soporte historial y que tengas la API Key correcta.');
      }
    } catch (error) {
      console.error('Error refreshing history:', error);
      alert('Error al cargar el historial');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage.trim(),
      timestamp: Date.now()
    };

    // Agregar mensaje del usuario inmediatamente
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, userMessage],
      lastMessageAt: Date.now()
    };

    setChats(chats.map(chat => chat.id === selectedChat.id ? updatedChat : chat));
    setSelectedChat(updatedChat);
    setNewMessage("");
    setIsLoading(true);

    try {
      const endpoint = endpoints.find(ep => ep.id === selectedChat.endpointId);
      if (!endpoint) throw new Error('Endpoint no encontrado');

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          selectedChat.historyMode === 'client' 
            ? {
                question: newMessage.trim(),
                chatId: selectedChat.chatId,
                history: selectedChat.messages.map(msg => ({
                  role: msg.role === 'user' ? 'userMessage' : 'apiMessage',
                  content: msg.content
                }))
              }
            : {
                question: newMessage.trim(),
                chatId: selectedChat.chatId
              }
        ),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la respuesta');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || data.message || 'Respuesta recibida',
        timestamp: Date.now()
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        lastMessageAt: Date.now()
      };

      setChats(chats.map(chat => chat.id === selectedChat.id ? finalChat : chat));
      setSelectedChat(finalChat);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        timestamp: Date.now()
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, errorMessage],
        lastMessageAt: Date.now()
      };

      setChats(chats.map(chat => chat.id === selectedChat.id ? finalChat : chat));
      setSelectedChat(finalChat);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="shadow-sm border-b px-4 py-4" style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderColor: 'var(--color-border)' 
      }}>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Chats</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Conversaciones con Flowise
        </p>
      </div>

      {!selectedChat ? (
        /* Lista de Chats */
        <div className="p-4">
          {/* Botón Crear Chat */}
          <div className="mb-6">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full py-3 px-4 rounded-lg border-2 border-dashed transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Chat
              </button>
            ) : (
              <div className="rounded-lg shadow-sm border p-4" style={{ 
                backgroundColor: 'var(--color-surface)', 
                borderColor: 'var(--color-border)' 
              }}>
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Crear Nuevo Chat
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Título del Chat
                    </label>
                    <input
                      type="text"
                      value={newChat.title}
                      onChange={(e) => setNewChat({...newChat, title: e.target.value})}
                      placeholder="Mi conversación con Flowise"
                      className="w-full p-3 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-surface-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Endpoint
                    </label>
                    <select
                      value={newChat.endpointId}
                      onChange={(e) => setNewChat({...newChat, endpointId: e.target.value})}
                      className="w-full p-3 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-surface-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <option value="">Selecciona un endpoint</option>
                      {endpoints.map((endpoint) => (
                        <option key={endpoint.id} value={endpoint.id}>
                          {endpoint.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Chat ID (opcional)
                    </label>
                    <input
                      type="text"
                      value={newChat.chatId}
                      onChange={(e) => setNewChat({...newChat, chatId: e.target.value})}
                      placeholder="Dejar vacío para generar automáticamente"
                      className="w-full p-3 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-surface-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Si proporcionas un Chat ID existente, se cargará el historial automáticamente.
                      {!endpoints.find(ep => ep.id === newChat.endpointId)?.apiKey && (
                        <span className="block mt-1 text-orange-600">
                          ⚠️ Este endpoint no tiene API Key configurada. Puede que no se pueda cargar el historial.
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Manejo del Historial
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="chatHistoryMode"
                            value="client"
                            checked={newChat.historyMode === 'client'}
                            onChange={(e) => setNewChat({...newChat, historyMode: e.target.value as 'client' | 'server'})}
                            className="mr-2"
                          />
                          <span style={{ color: 'var(--color-text-primary)' }}>Cliente (guardar localmente)</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="chatHistoryMode"
                            value="server"
                            checked={newChat.historyMode === 'server'}
                            onChange={(e) => setNewChat({...newChat, historyMode: e.target.value as 'client' | 'server'})}
                            className="mr-2"
                          />
                          <span style={{ color: 'var(--color-text-primary)' }}>Servidor (guardar en Flowise)</span>
                        </label>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {newChat.historyMode === 'client' 
                          ? 'El historial se guardará localmente y se enviará en cada mensaje.'
                          : 'El historial se guardará en Flowise. Solo se enviará el chatId.'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateChat}
                      disabled={isLoadingHistory}
                      className="flex-1 py-3 px-4 rounded-lg font-medium disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'white'
                      }}
                    >
                      {isLoadingHistory ? 'Cargando historial...' : 'Crear Chat'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewChat({ title: '', endpointId: '', chatId: '', historyMode: 'client' });
                      }}
                      className="flex-1 py-3 px-4 rounded-lg border"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Chats */}
          {chats.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                No tienes chats aún
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Crea tu primer chat para empezar a conversar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="rounded-lg shadow-sm border p-4 cursor-pointer transition-colors hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)' 
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {chat.title}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {chat.endpointName}
                      </p>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                          ID: {chat.chatId}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Historial: {chat.historyMode === 'client' ? 'Local' : 'Servidor'}
                        </p>
                      </div>
                    </div>
                    <div className="ml-3 text-right">
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {formatDate(chat.lastMessageAt)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                        {formatTime(chat.lastMessageAt)}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="mt-2 p-1 rounded hover:bg-red-50 transition-colors"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Vista de Chat */
        <div className="flex flex-col h-screen">
          {/* Header del Chat */}
          <div className="shadow-sm border-b px-4 py-3" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1 mx-3">
                <h2 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedChat.title}
                </h2>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedChat.endpointName} • {selectedChat.historyMode === 'client' ? 'Historial local' : 'Historial en servidor'}
                </p>
                <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  ID: {selectedChat.chatId}
                </p>
              </div>
              <button
                onClick={handleRefreshHistory}
                disabled={isLoadingHistory || selectedChat.historyMode === 'client'}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                style={{ color: 'var(--color-text-secondary)' }}
                title={selectedChat.historyMode === 'client' ? 'No disponible para historial local' : 'Refrescar historial desde servidor'}
              >
                <svg className={`w-5 h-5 ${isLoadingHistory ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteChat(selectedChat.id)}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedChat.messages.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-tertiary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Inicia la conversación
                </p>
              </div>
            ) : (
              selectedChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'rounded-br-sm'
                        : 'rounded-bl-sm'
                    }`}
                    style={{
                      backgroundColor: message.role === 'user' 
                        ? 'var(--color-accent)' 
                        : 'var(--color-surface-secondary)',
                      color: message.role === 'user' 
                        ? 'white' 
                        : 'var(--color-text-primary)'
                    }}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg rounded-bl-sm" style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  color: 'var(--color-text-primary)'
                }}>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                    <span className="text-sm">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input de Mensaje */}
          <div className="border-t p-4" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
