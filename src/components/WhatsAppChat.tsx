import { useState } from 'react';
import { MessageCircle, Phone, Video, MoreVertical, Send, Smile, Paperclip, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
    lastMessage: 'Hey! How are you doing today?',
    timestamp: '2:30 PM',
    unread: 2,
    online: true
  },
  {
    id: '2', 
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    lastMessage: 'Can we meet tomorrow for the project?',
    timestamp: '1:45 PM',
    unread: 0,
    online: false
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    lastMessage: 'Thanks for your help earlier!',
    timestamp: '12:20 PM',
    unread: 1,
    online: true
  },
  {
    id: '4',
    name: 'Michael Johnson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    lastMessage: 'See you at the meeting',
    timestamp: '11:15 AM',
    unread: 0,
    online: false
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
    lastMessage: 'Perfect! Let\'s do it 👍',
    timestamp: 'Yesterday',
    unread: 0,
    online: true
  }
];

const mockMessages: { [key: string]: Message[] } = {
  '1': [
    { id: '1', text: 'Hey! How are you doing today?', sender: 'them', timestamp: '2:25 PM' },
    { id: '2', text: 'I\'m doing great! Thanks for asking 😊', sender: 'me', timestamp: '2:26 PM', status: 'read' },
    { id: '3', text: 'That\'s wonderful to hear!', sender: 'them', timestamp: '2:30 PM' }
  ],
  '2': [
    { id: '1', text: 'Hi David!', sender: 'me', timestamp: '1:40 PM', status: 'read' },
    { id: '2', text: 'Can we meet tomorrow for the project?', sender: 'them', timestamp: '1:45 PM' }
  ],
  '3': [
    { id: '1', text: 'Thanks for your help earlier!', sender: 'them', timestamp: '12:20 PM' }
  ]
};

export default function WhatsAppChat() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>(mockMessages);
  const [showChat, setShowChat] = useState(false);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), message]
    }));

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowChat(true);
  };

  const goBackToList = () => {
    setShowChat(false);
    setSelectedContact(null);
  };

  return (
    <div className="h-screen flex bg-whatsapp-bg">
      {/* Chat List Sidebar */}
      <div className={`w-full md:w-80 bg-card border-r border-border flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 bg-whatsapp-green text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">WhatsApp</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {mockContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => selectContact(contact)}
              className={`p-4 cursor-pointer border-b border-border/50 hover:bg-muted/50 transition-colors ${
                selectedContact?.id === contact.id ? 'bg-whatsapp-green-light' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-whatsapp-online-status border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm text-foreground truncate">{contact.name}</h3>
                    <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">{contact.lastMessage}</p>
                </div>
                
                {contact.unread > 0 && (
                  <Badge className="bg-whatsapp-green text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                    {contact.unread}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className={`flex-1 flex flex-col ${showChat ? 'flex' : 'hidden md:flex'}`}>
          {/* Chat Header */}
          <div className="p-4 bg-card border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden text-muted-foreground hover:text-foreground"
                  onClick={goBackToList}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                    <AvatarFallback>{selectedContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {selectedContact.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-whatsapp-online-status border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-medium text-foreground">{selectedContact.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedContact.online ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-chat">
            <div className="space-y-4">
              {(messages[selectedContact.id] || []).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-message ${
                      message.sender === 'me'
                        ? 'bg-whatsapp-green text-white rounded-br-md'
                        : 'bg-whatsapp-message-received text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className={`text-xs ${
                        message.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp}
                      </span>
                      {message.sender === 'me' && message.status && (
                        <div className="text-white/70">
                          {message.status === 'sent' && '✓'}
                          {message.status === 'delivered' && '✓✓'}
                          {message.status === 'read' && <span className="text-blue-400">✓✓</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 bg-card border-t border-border">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Smile className="h-5 w-5" />
                </Button>
              </div>
              
              <Button 
                onClick={sendMessage}
                className="bg-whatsapp-green hover:bg-whatsapp-green-dark text-white rounded-full h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex-1 items-center justify-center bg-gradient-chat ${showChat ? 'hidden' : 'hidden md:flex'}`}>
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">Welcome to WhatsApp</h2>
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}