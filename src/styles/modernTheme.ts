// Modern tema stilleri ve gradient'ler
export const modernGradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  blue: 'linear-gradient(135deg, #667eea 0%, #4c9aff 100%)',
  purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  orange: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  green: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  dark: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
  light: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
};

export const modernShadows = {
  sm: '0 2px 4px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.07)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.15)',
  '2xl': '0 25px 50px rgba(0,0,0,0.25)',
  colored: '0 10px 40px rgba(102, 126, 234, 0.3)',
};

export const modernBorders = {
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
};

export const glassEffect = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

export const cardStyles = {
  modern: {
    bg: 'white',
    borderRadius: 'xl',
    boxShadow: modernShadows.lg,
    border: '1px solid',
    borderColor: 'gray.100',
    transition: 'all 0.3s ease',
    _hover: {
      transform: 'translateY(-4px)',
      boxShadow: modernShadows.xl,
    },
  },
  glass: {
    ...glassEffect,
    borderRadius: 'xl',
    transition: 'all 0.3s ease',
    _hover: {
      background: 'rgba(255, 255, 255, 0.15)',
    },
  },
  gradient: {
    bgGradient: modernGradients.primary,
    color: 'white',
    borderRadius: 'xl',
    boxShadow: modernShadows.colored,
    transition: 'all 0.3s ease',
    _hover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 15px 50px rgba(102, 126, 234, 0.4)',
    },
  },
};

export const buttonStyles = {
  modern: {
    borderRadius: 'lg',
    fontWeight: '600',
    px: 6,
    py: 3,
    transition: 'all 0.3s ease',
    _hover: {
      transform: 'translateY(-2px)',
      boxShadow: modernShadows.md,
    },
  },
  gradient: {
    bgGradient: modernGradients.primary,
    color: 'white',
    borderRadius: 'lg',
    fontWeight: '600',
    px: 6,
    py: 3,
    transition: 'all 0.3s ease',
    _hover: {
      bgGradient: modernGradients.blue,
      transform: 'translateY(-2px)',
      boxShadow: modernShadows.colored,
    },
  },
};

export const inputStyles = {
  modern: {
    borderRadius: 'lg',
    border: '2px solid',
    borderColor: 'gray.200',
    _focus: {
      borderColor: 'blue.500',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)',
    },
  },
};
