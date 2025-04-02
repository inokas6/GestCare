import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const ChatSystem = () => {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchUserTerm, setSearchUserTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Obter usuário logado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Carregar amigos e conversas
  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
      loadConversations();
      loadUsers();
    }
  }, [user]);

  const loadFriends = async () => {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        status,
        friend:friend_id(id, name, email, avatar_url)
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (!error) {
      setFriends(data);
    }
  };

  const loadFriendRequests = async () => {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        status,
        user:user_id(id, name, email, avatar_url)
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (!error) {
      setFriendRequests(data);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url')
      .neq('id', user.id)
      .ilike('name', `%${searchUserTerm}%`)
      .limit(10);

    if (!error) {
      setUsers(data);
    }
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('private_conversations')
      .select(`
        id,
        user1_id,
        user2_id,
        user1:user1_id(id, name, email, avatar_url),
        user2:user2_id(id, name, email, avatar_url),
        last_message:messages!conversation_id(content, created_at)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error) {
      setConversations(data);
    }
  };

  const loadMessages = async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        sender:user_id(id, name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error) {
      setMessages(data);
      setSelectedConversation(conversationId);
    }
  };

  const sendFriendRequest = async (friendId) => {
    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      });

    if (!error) {
      loadUsers();
    }
  };

  const acceptFriendRequest = async (requestId) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (!error) {
      loadFriendRequests();
      loadFriends();
    }
  };

  const rejectFriendRequest = async (requestId) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (!error) {
      loadFriendRequests();
    }
  };

  const startConversation = async (otherUserId) => {
    // Verifica se já existe uma conversa
    const { data: existingConversation, error } = await supabase
      .from('private_conversations')
      .select('id')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
      .single();

    if (existingConversation) {
      loadMessages(existingConversation.id);
      return;
    }

    // Cria nova conversa
    const { data: newConversation, error: createError } = await supabase
      .from('private_conversations')
      .insert({
        user1_id: user.id,
        user2_id: otherUserId
      })
      .select()
      .single();

    if (!createError) {
      loadMessages(newConversation.id);
      loadConversations();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        content: newMessage,
        sender_id: user.id,
        conversation_id: selectedConversation
      });

    if (!error) {
      setNewMessage('');
      loadMessages(selectedConversation);
      loadConversations();
    }
  };

  const filteredUsers = users.filter(u => 
    !friends.some(f => f.friend.id === u.id) &&
    !friendRequests.some(r => r.user.id === u.id)
  );

  return (
    <div className="min-h-screen bg-pink-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 border-r border-pink-100">
            <div className="p-4 border-b border-pink-100">
              <h2 className="text-xl font-bold text-pink-600 mb-4">Mensagens</h2>
              <div className="tabs tabs-boxed bg-pink-100">
                <button
                  className={`tab flex-1 ${activeTab === 'friends' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('friends')}
                >
                  Amigos
                </button>
                <button
                  className={`tab flex-1 ${activeTab === 'requests' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  Pedidos
                </button>
                <button
                  className={`tab flex-1 ${activeTab === 'find' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('find')}
                >
                  Encontrar
                </button>
              </div>
            </div>

            {/* Lista de amigos/conversas */}
            <div className="overflow-y-auto h-[calc(100vh-180px)]">
              {activeTab === 'friends' && (
                <div>
                  {friends.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhum amigo adicionado</p>
                  ) : (
                    friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="p-3 border-b border-pink-100 hover:bg-pink-50 cursor-pointer flex items-center justify-between"
                        onClick={() => startConversation(friend.friend.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center">
                              {friend.friend.avatar_url ? (
                                <img src={friend.friend.avatar_url} alt={friend.friend.name} className="w-full h-full rounded-full" />
                              ) : (
                                <span className="text-pink-600 font-bold">
                                  {friend.friend.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium">{friend.friend.name}</h3>
                            <p className="text-xs text-gray-500">{friend.friend.email}</p>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-ghost text-pink-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  {friendRequests.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhum pedido de amizade</p>
                  ) : (
                    friendRequests.map((request) => (
                      <div key={request.id} className="p-3 border-b border-pink-100 hover:bg-pink-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center">
                              {request.user.avatar_url ? (
                                <img src={request.user.avatar_url} alt={request.user.name} className="w-full h-full rounded-full" />
                              ) : (
                                <span className="text-pink-600 font-bold">
                                  {request.user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium">{request.user.name}</h3>
                            <p className="text-xs text-gray-500">{request.user.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-success flex-1"
                            onClick={() => acceptFriendRequest(request.id)}
                          >
                            Aceitar
                          </button>
                          <button
                            className="btn btn-sm btn-error flex-1"
                            onClick={() => rejectFriendRequest(request.id)}
                          >
                            Recusar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'find' && (
                <div>
                  <div className="p-3">
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      className="input input-bordered w-full"
                      value={searchUserTerm}
                      onChange={(e) => {
                        setSearchUserTerm(e.target.value);
                        loadUsers();
                      }}
                    />
                  </div>
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhum usuário encontrado</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="p-3 border-b border-pink-100 hover:bg-pink-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full" />
                              ) : (
                                <span className="text-pink-600 font-bold">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => sendFriendRequest(user.id)}
                        >
                          Adicionar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Área de conversa */}
          <div className="w-full md:w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Cabeçalho da conversa */}
                <div className="p-4 border-b border-pink-100 flex items-center gap-3">
                  {conversations.find(c => c.id === selectedConversation)?.user1.id === user.id ? (
                    <>
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center">
                          {conversations.find(c => c.id === selectedConversation)?.user2.avatar_url ? (
                            <img 
                              src={conversations.find(c => c.id === selectedConversation)?.user2.avatar_url} 
                              alt={conversations.find(c => c.id === selectedConversation)?.user2.name}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <span className="text-pink-600 font-bold text-xl">
                              {conversations.find(c => c.id === selectedConversation)?.user2.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">
                          {conversations.find(c => c.id === selectedConversation)?.user2.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {conversations.find(c => c.id === selectedConversation)?.user2.email}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center">
                          {conversations.find(c => c.id === selectedConversation)?.user1.avatar_url ? (
                            <img 
                              src={conversations.find(c => c.id === selectedConversation)?.user1.avatar_url} 
                              alt={conversations.find(c => c.id === selectedConversation)?.user1.name}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <span className="text-pink-600 font-bold text-xl">
                              {conversations.find(c => c.id === selectedConversation)?.user1.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">
                          {conversations.find(c => c.id === selectedConversation)?.user1.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {conversations.find(c => c.id === selectedConversation)?.user1.email}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Mensagens */}
                <div className="flex-1 p-4 overflow-y-auto bg-pink-50 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                            message.sender_id === user.id
                              ? 'bg-pink-500 text-white'
                              : 'bg-white text-gray-800 border border-pink-100'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">Nenhuma mensagem ainda</p>
                    </div>
                  )}
                </div>

                {/* Enviar mensagem */}
                <div className="p-4 border-t border-pink-100 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1"
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      className="btn btn-primary bg-pink-500 border-pink-500 hover:bg-pink-600"
                      onClick={sendMessage}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-pink-50">
                <div className="text-center p-6">
                  <div className="w-20 h-20 bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-pink-600"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    {activeTab === 'friends' ? 'Selecione um amigo para conversar' : 
                     activeTab === 'requests' ? 'Gerencie seus pedidos de amizade' : 
                     'Encontre e adicione novos amigos'}
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'friends' ? 'Comece uma conversa com seus amigos' : 
                     activeTab === 'requests' ? 'Aceite ou recuse pedidos de amizade' : 
                     'Busque por outros usuários para adicionar como amigos'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;