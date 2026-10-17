import Toast from 'react-native-toast-message';

export function showErrorToast(message: string) {
  Toast.show({
    type: 'error',
    text1: 'Terjadi kesalahan',
    text2: message,
    position: 'top',
    visibilityTime: 4500,
    autoHide: true,
    topOffset: 56,
  });
}

export function showSuccessToast(message: string) {
  Toast.show({
    type: 'success',
    text1: 'Berhasil',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 56,
  });
}
