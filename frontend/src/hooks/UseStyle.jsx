/* eslint-disable prettier/prettier */
import { useTheme } from '../context/ThemeProvider'

const useStyle = () => {
  const { colorModeContext } = useTheme()

  const styleSelect = {
    control: (base) => {
      return {
        ...base,
        width: '100%',
        maxWidth: '100%',
        borderRadius: '5px',
        padding: '2px',
        zIndex: 10, // Memberikan prioritas tinggi agar dropdown muncul di atas elemen lain
        position: 'relative',
        height: '100%',
      }
    },
    menu: (base) => ({
      ...base,
      zIndex: 20, // Pastikan menu dropdown tidak tertutup elemen lain
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected && colorModeContext === 'dark'
            ? '#5F6063'
            : isSelected && colorModeContext === 'light'
              ? '#DDE1E6'
              : isFocused && colorModeContext === 'dark'
                ? '#505769'
                : isFocused && colorModeContext === 'light'
                  ? '#44A1D9'
                  : undefined,
        color:
          colorModeContext === 'dark' && isSelected
            ? 'white'
            : colorModeContext === 'dark'
              ? 'white'
              : colorModeContext === 'light' && isFocused && isSelected
                ? 'black'
                : colorModeContext === 'light' && !isFocused && isSelected
                  ? 'black'
                  : colorModeContext === 'light' && isFocused && !isSelected
                    ? 'white'
                    : undefined,
        ':active': {
          ...styles[':active'],
          color:
            colorModeContext === 'light' && (isSelected || isFocused)
              ? 'white'
              : colorModeContext === 'dark'
                ? 'white'
                : 'black',
          backgroundColor: !isDisabled
            ? colorModeContext === 'light' && isSelected
              ? '#2C6C93'
              : colorModeContext === 'light'
                ? '#2C6C93'
                : colorModeContext === 'dark'
                  ? '#454A58'
                  : ''
            : undefined,
        },
        ':hover': {
          ...styles[':hover'],
          color: colorModeContext === 'light' && !isSelected ? 'white' : '',
        },
      }
    },
  }

  return {
    styleSelect,
  }
}

export default useStyle
