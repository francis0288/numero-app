import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function HomeScreen() {
  const { t } = useTranslation()
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-4xl font-medium">{t('appName')}</Text>
      <Text className="mt-4 text-lg text-gray-600">
        Professional numerology reading tool
      </Text>
    </View>
  )
}
