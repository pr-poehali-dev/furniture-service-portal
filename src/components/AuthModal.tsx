import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { auth, storage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: any, token: string) => void;
}

export default function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { user, token } = await auth.login(email, password);
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(user));
      toast({
        title: 'Успешно!',
        description: 'Вы вошли в систему',
      });
      onSuccess(user, token);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось войти',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      user_type: formData.get('user_type') as 'customer' | 'master',
      city: formData.get('city') as string,
      specialty: formData.get('specialty') as string,
    };

    try {
      const { user, token } = await auth.register(data);
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(user));
      toast({
        title: 'Успешно!',
        description: 'Регистрация завершена',
      });
      onSuccess(user, token);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось зарегистрироваться',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Hammer" size={24} className="text-primary" />
            Вход в МебельМастер
          </DialogTitle>
          <DialogDescription>
            Войдите или зарегистрируйтесь для доступа ко всем возможностям
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="example@mail.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Пароль</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="mr-2 h-4 w-4" />
                    Войти
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-type">Я хочу</Label>
                <RadioGroup defaultValue="customer" name="user_type">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer" className="font-normal cursor-pointer">
                      Заказать мебель
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="master" id="master" />
                    <Label htmlFor="master" className="font-normal cursor-pointer">
                      Принимать заказы как мастер
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-name">Полное имя</Label>
                <Input
                  id="register-name"
                  name="full_name"
                  placeholder="Иван Иванов"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="example@mail.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone">Телефон</Label>
                <Input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-city">Город</Label>
                <Input
                  id="register-city"
                  name="city"
                  placeholder="Москва"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-specialty">Специализация (для мастеров)</Label>
                <Input
                  id="register-specialty"
                  name="specialty"
                  placeholder="Кухни на заказ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  <>
                    <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                    Зарегистрироваться
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
