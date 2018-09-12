module VersionUtils

  def VersionUtils.versionStringIsValid(version_string)
    version_string_array = version_string.split(".")
    for number_string in version_string_array do
      is_number = /\A\d+\z/ =~ number_string
      unless is_number; false end
    end

    true
  end

  def VersionUtils.versionStringIsCorrectLength(version_string)
    version_string.split(".").length == 3
  end

  def VersionUtils.isNewVersionBiggerThanOldVersion(new_version_number_string, old_version_number_string)
    new_version_array = new_version_number_string.split(".").map(&:to_i)
    old_version_array = old_version_number_string.split(".").map(&:to_i)
    for index in 0..2
      if new_version_array[index] > old_version_array[index]
        return true
      end
      if new_version_array[index] < old_version_array[index]
        return false
      end
    end
    false
  end

end
