import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = [
  { name: 'Кухни', icon: 'ChefHat' },
  { name: 'Шкафы', icon: 'DoorOpen' },
  { name: 'Столы', icon: 'Table' },
  { name: 'Кровати', icon: 'Bed' },
  { name: 'Офисная мебель', icon: 'Briefcase' },
  { name: 'Декор', icon: 'Palette' },
];

const masters = [
  {
    id: 1,
    name: 'Алексей Петров',
    specialty: 'Кухни на заказ',
    rating: 4.9,
    reviews: 127,
    completed: 143,
    experience: '8 лет',
    city: 'Москва',
    avatar: 'https://i.pravatar.cc/150?img=12',
    verified: true,
    portfolio: [
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
      'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=400',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    ],
    description: 'Специализируюсь на изготовлении современных кухонь премиум-класса. Использую только качественные материалы.',
  },
  {
    id: 2,
    name: 'Дмитрий Соколов',
    specialty: 'Мебель из массива',
    rating: 5.0,
    reviews: 89,
    completed: 94,
    experience: '12 лет',
    city: 'Санкт-Петербург',
    avatar: 'https://i.pravatar.cc/150?img=33',
    verified: true,
    portfolio: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400',
    ],
    description: 'Изготавливаю эксклюзивную мебель из натурального дерева. Каждое изделие - произведение искусства.',
  },
  {
    id: 3,
    name: 'Ольга Кузнецова',
    specialty: 'Детская мебель',
    rating: 4.8,
    reviews: 156,
    completed: 189,
    experience: '6 лет',
    city: 'Казань',
    avatar: 'https://i.pravatar.cc/150?img=47',
    verified: true,
    portfolio: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    ],
    description: 'Создаю безопасную и яркую мебель для детей. Использую только экологичные материалы.',
  },
  {
    id: 4,
    name: 'Игорь Волков',
    specialty: 'Офисная мебель',
    rating: 4.7,
    reviews: 73,
    completed: 85,
    experience: '10 лет',
    city: 'Новосибирск',
    avatar: 'https://i.pravatar.cc/150?img=15',
    verified: true,
    portfolio: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400',
    ],
    description: 'Производство качественной офисной мебели. Функциональность и стиль в каждом проекте.',
  },
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<typeof masters[0] | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Hammer" size={32} className="text-primary" />
            <span className="text-2xl font-bold text-primary">МебельМастер</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Главная</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Мастера</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Портфолио</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">О сервисе</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost">Войти</Button>
            <Button>Регистрация</Button>
          </div>
        </div>
      </header>

      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://cdn.poehali.dev/projects/cdd2b9aa-0d83-483d-9d14-44ccfbd076e8/files/6596ca78-f2e1-4bf0-8485-4c415f84b004.jpg" 
            alt="Мебельная мастерская"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/50" />
        </div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Найдите мастера для изготовления мебели
            </h1>
            <p className="text-xl mb-8 text-muted-foreground">
              Профессионалы с проверенным опытом и портфолио. Гарантия качества на каждый проект.
            </p>
            <div className="flex gap-3 max-w-xl">
              <Input 
                placeholder="Поиск мастера или услуги..." 
                className="h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="lg" className="h-12 px-8">
                <Icon name="Search" size={20} className="mr-2" />
                Найти
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Категории услуг</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.name}
              className={`hover-scale cursor-pointer transition-all ${
                selectedCategory === category.name ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <Icon name={category.icon as any} size={40} className="text-primary" />
                <span className="text-sm font-medium text-center">{category.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Лучшие мастера</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Icon name="SlidersHorizontal" size={16} className="mr-2" />
              Фильтры
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {masters.map((master) => (
            <Card key={master.id} className="hover-scale overflow-hidden animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={master.avatar} alt={master.name} />
                    <AvatarFallback>{master.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {master.name}
                      {master.verified && (
                        <Icon name="BadgeCheck" size={16} className="text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription>{master.specialty}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{master.rating}</span>
                  <span className="text-sm text-muted-foreground">({master.reviews} отзывов)</span>
                </div>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <Icon name="MapPin" size={14} />
                  <span>{master.city}</span>
                </div>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <Icon name="Briefcase" size={14} />
                  <span>Опыт: {master.experience}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <Badge variant="secondary">{master.completed} проектов</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {master.portfolio.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="aspect-square rounded overflow-hidden">
                      <img 
                        src={img} 
                        alt={`Работа ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedMaster(master)}
                    >
                      <Icon name="Eye" size={16} className="mr-2" />
                      Профиль
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {master.name}
                        {master.verified && (
                          <Icon name="BadgeCheck" size={20} className="text-primary" />
                        )}
                      </DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="about" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="about">О мастере</TabsTrigger>
                        <TabsTrigger value="portfolio">Портфолио</TabsTrigger>
                        <TabsTrigger value="reviews">Отзывы</TabsTrigger>
                      </TabsList>
                      <TabsContent value="about" className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={master.avatar} alt={master.name} />
                            <AvatarFallback>{master.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-semibold">{master.name}</h3>
                            <p className="text-muted-foreground">{master.specialty}</p>
                          </div>
                        </div>
                        <p className="text-sm">{master.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Icon name="Star" size={18} className="text-yellow-500" />
                            <span>Рейтинг: <strong>{master.rating}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="MessageSquare" size={18} className="text-primary" />
                            <span><strong>{master.reviews}</strong> отзывов</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle" size={18} className="text-green-500" />
                            <span><strong>{master.completed}</strong> проектов</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Calendar" size={18} className="text-primary" />
                            <span>Опыт: <strong>{master.experience}</strong></span>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="portfolio">
                        <div className="grid grid-cols-2 gap-4">
                          {master.portfolio.map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                              <img 
                                src={img} 
                                alt={`Работа ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="reviews" className="space-y-4">
                        {[1, 2, 3].map((review) => (
                          <Card key={review}>
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={`https://i.pravatar.cc/150?img=${review + 50}`} />
                                  <AvatarFallback>КЛ</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-sm">Клиент {review}</CardTitle>
                                  <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Icon key={i} name="Star" size={12} className="text-yellow-500 fill-yellow-500" />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Отличная работа! Мастер выполнил всё точно в срок и с высоким качеством.
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>
                    </Tabs>
                    <div className="flex gap-3 pt-4">
                      <Button className="flex-1">
                        <Icon name="MessageCircle" size={18} className="mr-2" />
                        Написать
                      </Button>
                      <Button className="flex-1">
                        <Icon name="FileText" size={18} className="mr-2" />
                        Оставить заявку
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button className="flex-1">
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Написать
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">2000+</h3>
              <p className="text-muted-foreground">Проверенных мастеров</p>
            </div>
            <div className="animate-fade-in">
              <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">15 000+</h3>
              <p className="text-muted-foreground">Выполненных проектов</p>
            </div>
            <div className="animate-fade-in">
              <Icon name="Star" size={48} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">4.8</h3>
              <p className="text-muted-foreground">Средний рейтинг</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Hammer" size={24} className="text-primary" />
                <span className="text-xl font-bold">МебельМастер</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Платформа для поиска профессионалов в изготовлении мебели
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Для заказчиков</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Найти мастера</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Оставить заявку</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Портфолио</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Для исполнителей</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Регистрация</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Тарифы</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Помощь</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  <a href="mailto:info@mebelmaster.ru" className="hover:text-primary transition-colors">
                    info@mebelmaster.ru
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  <a href="tel:+79991234567" className="hover:text-primary transition-colors">
                    +7 (999) 123-45-67
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 МебельМастер. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
