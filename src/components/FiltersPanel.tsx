import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface FiltersPanelProps {
  onFilterChange: (filters: {
    city?: string;
    category?: string;
    min_rating?: number;
    verified?: boolean;
    search?: string;
  }) => void;
  categories: Array<{ name: string }>;
}

export default function FiltersPanel({ onFilterChange, categories }: FiltersPanelProps) {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [minRating, setMinRating] = useState<number | undefined>();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [search, setSearch] = useState('');

  const applyFilters = () => {
    onFilterChange({
      city: city || undefined,
      category: category || undefined,
      min_rating: minRating,
      verified: verifiedOnly,
      search: search || undefined,
    });
  };

  const resetFilters = () => {
    setCity('');
    setCategory('');
    setMinRating(undefined);
    setVerifiedOnly(false);
    setSearch('');
    onFilterChange({});
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon name="SlidersHorizontal" size={16} className="mr-2" />
          Фильтры
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Фильтры поиска</SheetTitle>
          <SheetDescription>
            Настройте параметры для поиска подходящих мастеров
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="search">Поиск по имени или специализации</Label>
            <Input
              id="search"
              placeholder="Введите текст для поиска..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Город</Label>
            <Input
              id="city"
              placeholder="Москва"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория услуг</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все категории</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Минимальный рейтинг</Label>
            <Select
              value={minRating?.toString() || ''}
              onValueChange={(val) => setMinRating(val ? parseFloat(val) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Любой рейтинг" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Любой рейтинг</SelectItem>
                <SelectItem value="4.8">4.8+</SelectItem>
                <SelectItem value="4.5">4.5+</SelectItem>
                <SelectItem value="4.0">4.0+</SelectItem>
                <SelectItem value="3.5">3.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="verified" className="flex flex-col gap-1">
              <span>Только верифицированные</span>
              <span className="text-xs text-muted-foreground font-normal">
                Мастера с подтвержденным профилем
              </span>
            </Label>
            <Switch
              id="verified"
              checked={verifiedOnly}
              onCheckedChange={setVerifiedOnly}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={applyFilters} className="flex-1">
              <Icon name="Check" size={16} className="mr-2" />
              Применить
            </Button>
            <Button onClick={resetFilters} variant="outline" className="flex-1">
              <Icon name="X" size={16} className="mr-2" />
              Сбросить
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
