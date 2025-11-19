import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class');
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base-class', undefined, null)).toBe('base-class');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });
});
