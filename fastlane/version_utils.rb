module VersionUtils
  def self.versionStringIsValid(version_string)
    version_string_array = version_string.split(".")
    is_all_numbers = true
    version_string_array.each do |number_string|
      is_number = !/\A\d+\z/.match(number_string).nil?
      unless is_number then is_all_numbers &= false end
    end
    is_all_numbers
  end

  def self.versionStringIsCorrectLength(version_string)
    version_string.split(".").length == 3
  end

  def self.isNewVersionBiggerThanOldVersion(new_version_number_string, old_version_number_string)
    new_version_array = new_version_number_string.split(".").map(&:to_i)
    old_version_array = old_version_number_string.split(".").map(&:to_i)
    old_version_array.each_index do |index|
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
