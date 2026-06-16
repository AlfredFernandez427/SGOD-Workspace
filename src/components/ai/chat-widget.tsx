
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, User, Minus, Maximize2, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, serverTimestamp, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ensure thread existence on first open
  useEffect(() => {
    if (isOpen && user && firestore) {
      // Create thread metadata document with members array
      const threadRef = doc(firestore, 'support_chats', user.uid);
      setDocumentNonBlocking(threadRef, {
        members: [user.uid],
        updatedAt: serverTimestamp(),
        lastMessage: "Conversation Initiated"
      }, { merge: true });
    }
  }, [isOpen, user?.uid, firestore]);

  // Hierarchical Query: Scoped specifically to the user's thread
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'support_chats', user.uid, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
  }, [firestore, user?.uid]);

  const { data: messages, isLoading: isMessagesLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting || !firestore || !user) return;

    const userMessage = input.trim();
    setInput('');
    setIsSubmitting(true);

    try {
      // Write to the user's specific subcollection
      addDocumentNonBlocking(collection(firestore, 'support_chats', user.uid, 'messages'), {
        senderId: user.uid,
        senderType: 'user',
        content: userMessage,
        createdAt: serverTimestamp() 
      });
    } catch (error) {
      console.error("Support Channel Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl bg-primary text-white shadow-2xl z-50 group">
        <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-8 right-8 w-96 bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 transition-all overflow-hidden",
      isMinimized ? "h-16" : "h-[550px]"
    )}>
      <div className="p-4 bg-primary text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <User size={18} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest">Support Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 hover:bg-white/10 text-white">
            {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-white/10 text-white">
            <X size={14} />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {!user && !isUserLoading && (
                <div className="text-center py-10 opacity-50">
                  <p className="text-[10px] font-black uppercase tracking-widest">Establishing Secure Link...</p>
                </div>
              )}
              {isMessagesLoading && (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
              )}
              {messages?.map((msg, i) => (
                <div key={msg.id || i} className={cn("flex items-start gap-3", msg.senderType === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", msg.senderType === 'user' ? "bg-accent text-white" : "bg-primary text-white")}>
                    {msg.senderType === 'user' ? <User size={14} /> : <ShieldCheck size={14} />}
                  </div>
                  <div className={cn("p-4 rounded-2xl text-[13px] font-medium leading-relaxed max-w-[80%]", msg.senderType === 'user' ? "bg-accent text-white rounded-tr-none" : "bg-secondary/30 text-foreground rounded-tl-none border")}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <form onSubmit={handleSend} className="p-4 border-t border-border bg-secondary/5 flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Message Division Staff..." 
              className="h-12 bg-background/50 rounded-xl text-xs" 
              disabled={isSubmitting || !user} 
            />
            <Button type="submit" disabled={isSubmitting || !input.trim() || !user} className="h-12 w-12 rounded-xl bg-primary text-white p-0 shrink-0">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
