module VersionUtils
  def self.versionStringIsValid(version_string)
    Gem::Version.new(version_string) rescue false
  end

  def self.versionStringIsCorrectLength(version_string)
    version_string.split(".").length == 3
  end

  def self.isNewVersionBiggerThanOldVersion(new_version_number_string, old_version_number_string)
    Gem::Version.new(new_version_number_string) > Gem::Version.new(old_version_number_string)
  end
end
