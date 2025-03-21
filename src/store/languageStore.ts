import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

// Define available languages
export type Language = 'en' | 'vi';

// Define language settings type
export interface LanguageSettings {
  id?: string;
  user_id: string;
  language: Language;
  created_at?: string;
  updated_at?: string;
}

interface LanguageState {
  language: Language;
  translations: Record<string, Record<string, string>>;
  loading: boolean;
  error: string | null;
  
  // Actions
  setLanguage: (language: Language) => void;
  translate: (key: string) => string;
  loadLanguageSettings: (userId: string) => Promise<void>;
  saveLanguageSettings: (userId: string) => Promise<void>;
}

// Load translations
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    'app.title': 'Chat Application',
    'app.loading': 'Loading...',
    'app.error': 'An error occurred',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.delete': 'Delete',
    'app.edit': 'Edit',
    'app.add': 'Add',
    'app.back': 'Back',
    'app.signOut': 'Sign Out',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.login': 'Log In',
    'auth.signup': 'Sign Up',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.loginSubtitle': 'Sign in to your account',
    'auth.signupSubtitle': 'Create a new account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': 'Don\'t have an account?',
    'auth.confirmPassword': 'Confirm Password',
    'auth.signIn': 'Sign In',
    'auth.createAccount': 'Create Account',
    'auth.rememberMe': 'Remember me',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.confirmPasswordPlaceholder': 'Confirm your password',
    'auth.emailRequired': 'Email is required',
    'auth.emailInvalid': 'Email is invalid',
    'auth.passwordRequired': 'Password is required',
    'auth.passwordMinLength': 'Password must be at least 6 characters',
    'auth.confirmPasswordRequired': 'Please confirm your password',
    'auth.passwordsDoNotMatch': 'Passwords do not match',
    
    // Chat
    'chat.sessions': 'Chat Sessions',
    'chat.newChat': 'New Chat',
    'chat.deleteSession': 'Delete Session',
    'chat.renameSession': 'Rename Session',
    'chat.sessionName': 'Session Name',
    'chat.typeMessage': 'Type your message...',
    'chat.send': 'Send',
    'chat.welcome': 'Welcome',
    'chat.welcomeMessage': 'Start a new conversation by typing a message below.',
    'chat.examplePrompts': 'Example prompts:',
    'chat.setupExamplePrompts': 'Set up example prompts',
    'chat.noSessions': 'No chat sessions yet',
    'chat.noMessages': 'No messages in this chat',
    'chat.startConversation': 'Start a conversation by sending a message',
    'chat.thinking': 'Thinking...',
    
    // Settings
    'settings.title': 'Settings',
    'settings.webhook': 'Webhook Settings',
    'settings.webhookUrl': 'Webhook URL',
    'settings.customVariables': 'Custom Variables',
    'settings.variableName': 'Variable Name',
    'settings.value': 'Value',
    'settings.addVariable': 'Add Variable',
    'settings.saveSettings': 'Save Settings',
    'settings.testWebhook': 'Test Webhook',
    'settings.sendTestPing': 'Send Test Ping',
    'settings.testing': 'Testing',
    'settings.prompts': 'Example Prompts',
    'settings.addPrompt': 'Add New Example Prompt',
    'settings.currentPrompts': 'Current Example Prompts',
    'settings.noPrompts': 'No example prompts added yet. Add some prompts to help your users get started.',
    'settings.aboutPrompts': 'About Example Prompts',
    'settings.promptsDescription': 'Example prompts are shown to users when they start a new chat. They help guide users on what kinds of questions or requests they can make.',
    'settings.promptsOrder': 'These prompts will be displayed in the order shown above. You can reorder them using the up and down arrows.',
    'settings.language': 'Language Settings',
    'settings.selectLanguage': 'Select Language',
    'settings.english': 'English',
    'settings.vietnamese': 'Vietnamese',
    'settings.languageDescription': 'Choose your preferred language for the application interface.',
    'settings.languageSaved': 'Language settings saved successfully!',
    
    // Confirmations
    'confirm.deletePrompt': 'Are you sure you want to delete this example prompt?',
    'confirm.deleteSession': 'Are you sure you want to delete this session?',
    
    // Success messages
    'success.saved': 'Settings saved successfully!',
    'success.promptAdded': 'Example prompt added successfully!',
    'success.promptUpdated': 'Example prompt updated successfully!',
    'success.promptDeleted': 'Example prompt deleted successfully!',
    'success.promptsReordered': 'Example prompts reordered successfully!',
    'success.webhookTest': 'Webhook test successful! Check your webhook endpoint for the received PING.',
    
    // Error messages
    'error.webhookTest': 'Webhook test failed:',
    'error.timeout': 'Webhook test timed out after 10 seconds. The webhook might be taking too long to respond.',
    'error.addPrompt': 'Failed to add prompt:',
    'error.updatePrompt': 'Failed to update prompt:',
    'error.deletePrompt': 'Failed to delete prompt:',
    'error.loadPrompts': 'Failed to load prompts:',
    'error.reorderPrompts': 'Failed to reorder prompts:',
    
    // Footer
    'footer.allRightsReserved': 'All Rights Reserved',
  },
  vi: {
    // Common
    'app.title': 'Ứng dụng Trò chuyện',
    'app.loading': 'Đang tải...',
    'app.error': 'Đã xảy ra lỗi',
    'app.save': 'Lưu',
    'app.cancel': 'Hủy',
    'app.delete': 'Xóa',
    'app.edit': 'Sửa',
    'app.add': 'Thêm',
    'app.back': 'Quay lại',
    'app.signOut': 'Đăng xuất',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Mật khẩu',
    'auth.username': 'Tên người dùng',
    'auth.login': 'Đăng nhập',
    'auth.signup': 'Đăng ký',
    'auth.forgotPassword': 'Quên mật khẩu?',
    'auth.loginSubtitle': 'Đăng nhập vào tài khoản của bạn',
    'auth.signupSubtitle': 'Tạo tài khoản mới',
    'auth.alreadyHaveAccount': 'Đã có tài khoản?',
    'auth.dontHaveAccount': 'Chưa có tài khoản?',
    'auth.confirmPassword': 'Xác nhận mật khẩu',
    'auth.signIn': 'Đăng nhập',
    'auth.createAccount': 'Tạo tài khoản',
    'auth.rememberMe': 'Ghi nhớ đăng nhập',
    'auth.emailPlaceholder': 'Nhập email của bạn',
    'auth.passwordPlaceholder': 'Nhập mật khẩu',
    'auth.confirmPasswordPlaceholder': 'Xác nhận mật khẩu',
    'auth.emailRequired': 'Email là bắt buộc',
    'auth.emailInvalid': 'Email không hợp lệ',
    'auth.passwordRequired': 'Mật khẩu là bắt buộc',
    'auth.passwordMinLength': 'Mật khẩu phải có ít nhất 6 ký tự',
    'auth.confirmPasswordRequired': 'Vui lòng xác nhận mật khẩu',
    'auth.passwordsDoNotMatch': 'Mật khẩu không khớp',
    
    // Chat
    'chat.sessions': 'Phiên trò chuyện',
    'chat.newChat': 'Trò chuyện mới',
    'chat.deleteSession': 'Xóa phiên',
    'chat.renameSession': 'Đổi tên phiên',
    'chat.sessionName': 'Tên phiên',
    'chat.typeMessage': 'Nhập tin nhắn của bạn...',
    'chat.send': 'Gửi',
    'chat.welcome': 'Chào mừng',
    'chat.welcomeMessage': 'Bắt đầu cuộc trò chuyện mới bằng cách nhập tin nhắn bên dưới.',
    'chat.examplePrompts': 'Ví dụ câu hỏi:',
    'chat.setupExamplePrompts': 'Thiết lập câu hỏi mẫu',
    'chat.noSessions': 'Chưa có phiên trò chuyện nào',
    'chat.noMessages': 'Không có tin nhắn trong cuộc trò chuyện này',
    'chat.startConversation': 'Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn',
    'chat.thinking': 'Đang suy nghĩ...',
    
    // Settings
    'settings.title': 'Cài đặt',
    'settings.webhook': 'Cài đặt Webhook',
    'settings.webhookUrl': 'URL Webhook',
    'settings.customVariables': 'Biến tùy chỉnh',
    'settings.variableName': 'Tên biến',
    'settings.value': 'Giá trị',
    'settings.addVariable': 'Thêm biến',
    'settings.saveSettings': 'Lưu cài đặt',
    'settings.testWebhook': 'Kiểm tra Webhook',
    'settings.sendTestPing': 'Gửi Ping thử nghiệm',
    'settings.testing': 'Đang kiểm tra',
    'settings.prompts': 'Câu hỏi mẫu',
    'settings.addPrompt': 'Thêm câu hỏi mẫu mới',
    'settings.currentPrompts': 'Câu hỏi mẫu hiện tại',
    'settings.noPrompts': 'Chưa có câu hỏi mẫu nào được thêm. Hãy thêm một số câu hỏi để giúp người dùng bắt đầu.',
    'settings.aboutPrompts': 'Về câu hỏi mẫu',
    'settings.promptsDescription': 'Câu hỏi mẫu được hiển thị cho người dùng khi họ bắt đầu cuộc trò chuyện mới. Chúng giúp hướng dẫn người dùng về các loại câu hỏi hoặc yêu cầu họ có thể đặt ra.',
    'settings.promptsOrder': 'Các câu hỏi này sẽ được hiển thị theo thứ tự như trên. Bạn có thể sắp xếp lại chúng bằng các mũi tên lên và xuống.',
    'settings.language': 'Cài đặt ngôn ngữ',
    'settings.selectLanguage': 'Chọn ngôn ngữ',
    'settings.english': 'Tiếng Anh',
    'settings.vietnamese': 'Tiếng Việt',
    'settings.languageDescription': 'Chọn ngôn ngữ ưa thích cho giao diện ứng dụng.',
    'settings.languageSaved': 'Cài đặt ngôn ngữ đã được lưu thành công!',
    
    // Confirmations
    'confirm.deletePrompt': 'Bạn có chắc chắn muốn xóa câu hỏi mẫu này không?',
    'confirm.deleteSession': 'Bạn có chắc chắn muốn xóa phiên này không?',
    
    // Success messages
    'success.saved': 'Cài đặt đã được lưu thành công!',
    'success.promptAdded': 'Câu hỏi mẫu đã được thêm thành công!',
    'success.promptUpdated': 'Câu hỏi mẫu đã được cập nhật thành công!',
    'success.promptDeleted': 'Câu hỏi mẫu đã được xóa thành công!',
    'success.promptsReordered': 'Câu hỏi mẫu đã được sắp xếp lại thành công!',
    'success.webhookTest': 'Kiểm tra webhook thành công! Kiểm tra điểm cuối webhook của bạn để xem PING đã nhận.',
    
    // Error messages
    'error.webhookTest': 'Kiểm tra webhook thất bại:',
    'error.timeout': 'Kiểm tra webhook đã hết thởi gian sau 10 giây. Webhook có thể đang mất quá nhiều thởi gian để phản hồi.',
    'error.addPrompt': 'Không thể thêm câu hỏi mẫu:',
    'error.updatePrompt': 'Không thể cập nhật câu hỏi mẫu:',
    'error.deletePrompt': 'Không thể xóa câu hỏi mẫu:',
    'error.loadPrompts': 'Không thể tải câu hỏi mẫu:',
    'error.reorderPrompts': 'Không thể sắp xếp lại câu hỏi mẫu:',
    
    // Footer
    'footer.allRightsReserved': 'Đã Đăng Ký Bản Quyền',
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      translations,
      loading: false,
      error: null,
      
      setLanguage: (language: Language) => {
        set({ language });
      },
      
      translate: (key: string) => {
        const { language, translations } = get();
        return translations[language]?.[key] || translations['en'][key] || key;
      },
      
      loadLanguageSettings: async (userId: string) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await supabase
            .from('language_settings')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          
          if (data) {
            set({ language: data.language as Language });
          }
        } catch (error: any) {
          set({ error: error.message });
          console.error("Error loading language settings:", error);
        } finally {
          set({ loading: false });
        }
      },
      
      saveLanguageSettings: async (userId: string) => {
        try {
          set({ loading: true, error: null });
          
          const { language } = get();
          
          // Check if settings already exist
          const { data: existingData, error: checkError } = await supabase
            .from('language_settings')
            .select('id')
            .eq('user_id', userId)
            .single();
          
          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }
          
          if (existingData) {
            // Update existing settings
            const { error } = await supabase
              .from('language_settings')
              .update({ 
                language,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingData.id);
            
            if (error) throw error;
          } else {
            // Create new settings
            const { error } = await supabase
              .from('language_settings')
              .insert({
                id: crypto.randomUUID(),
                user_id: userId,
                language,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (error) throw error;
          }
        } catch (error: any) {
          set({ error: error.message });
          console.error("Error saving language settings:", error);
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ language: state.language }),
    }
  )
);
