module VersionUtils

  def VersionUtils.versionStringIsValid (versionString)
    versionStringArray = versionString.split(".")
  
    for numberString in versionStringArray do
      convertedString = Integer(numberString) rescue false
      if !convertedString then
        return false
      end
    end

    return true
  end

  def VersionUtils.versionStringIsCorrectLength (versionString)
    versionStringArray = versionString.split(".")
    return versionStringArray.length == 3
  end
  
  def VersionUtils.isNewVersionBiggerThanOldVersion (newVersionNumberString, oldVersionNumberString)
    newVersionArray = newVersionNumberString.split(".").map { |numberString| numberString.to_i }
    oldVersionArray = oldVersionNumberString.split(".").map { |numberString| numberString.to_i }
  
    for index in 0..2
      if newVersionArray[index] > oldVersionArray[index] then
        return true
      end
      if newVersionArray[index] < oldVersionArray[index] then
        return false
      end
    end
    return false
  end
end